from fastapi import APIRouter  # change this import
from pydantic import BaseModel
from openai import OpenAI
from app.interviewer.state import interview_state as state
from app.interviewer.prompts import question_prompt, evaluation_prompt
from dotenv import load_dotenv
from app.interviewer.report_generator import append_to_report
import json

load_dotenv()
client = OpenAI()

router = APIRouter()  # CHANGE: was app = FastAPI()

transcript = []
history = [{"role": "system", "content": f"You are an interviewer for a {state.role} position."}]

class Answer(BaseModel):
    answer: str  # CHANGE: was 'text' — now matches what React sends

class RoleSetup(BaseModel):
    role: str

def ask_ai(prompt):
    history.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history
    )
    content = response.choices[0].message.content.strip()
    history.append({"role": "assistant", "content": content})
    return content

@router.post("/setup")  # CHANGE: @app -> @router (all routes below too)
def setup_role(data: RoleSetup):
    global history, transcript
    state.role = data.role
    state.question_number = 1
    transcript.clear()
    history = [{
        "role": "system",
        "content": f"You are a professional interviewer for the position of {state.role}."
    }]
    return {"status": "success", "role": state.role}

@router.post("/start")  # CHANGE: was GET, now POST
def start_interview():
    q_prompt = question_prompt(state.role, state.difficulty, state.question_number)
    question = ask_ai(q_prompt)
    return {"question": question}

@router.post("/answer")
def submit_answer(answer: Answer):
    last_question = next((msg["content"] for msg in reversed(history) if msg["role"] == "assistant"), "No question found")
    transcript.append({"question": last_question, "answer": answer.answer})
    history.append({"role": "user", "content": f"My answer: {answer.answer}"})

    e_prompt = evaluation_prompt(last_question, answer.answer)
    evaluation = ask_ai(e_prompt)
    state.question_number += 1

    if state.question_number > state.max_questions:
        return {"done": True, "evaluation": evaluation}

    next_q_prompt = question_prompt(state.role, state.difficulty, state.question_number)
    next_question = ask_ai(next_q_prompt)
    return {"done": False, "evaluation": evaluation, "next_question": next_question}

@router.post("/end")
def end_interview():
    final_prompt = """
    End the interview and output JSON with:
    - communication_score (1-10)
    - knowledge_score (1-10)
    - confidence_score (1-10)
    - strengths (array of 3 strings)
    - improvements (array of 3 strings)
    Do not include any text outside the JSON.
    """
    final_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history + [{"role": "user", "content": final_prompt}],
        response_format={"type": "json_object"}
    )
    final_data = json.loads(final_response.choices[0].message.content)
    final_data["role"] = state.role
    ai_check = check_ai_content(transcript)
    final_data["ai_detection"] = ai_check
    append_to_report(transcript, final_data)
    return {"status": "completed", "ai_score": ai_check.get("ai_probability")}

def check_ai_content(transcript):
    full_text = " ".join([e['answer'] for e in transcript])
    prompt = f"Analyze for AI generation signs. TEXT: {full_text}\nOutput JSON: ai_probability (0-100), reasoning, human_markers"
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)