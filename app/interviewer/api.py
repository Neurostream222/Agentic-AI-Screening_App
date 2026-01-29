from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from state import InterviewState
from prompts import question_prompt, evaluation_prompt
from dotenv import load_dotenv
from report_generator import append_to_report
import json
from fastapi.middleware.cors import CORSMiddleware
import requests

load_dotenv()
client = OpenAI()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state = InterviewState()
transcript = []
history = [{"role": "system", "content": f"You are an interviewer for a {state.role} position."}]

class Answer(BaseModel):
    text: str

def ask_ai(prompt):
    history.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history
    )
    content = response.choices[0].message.content.strip()
    history.append({"role": "assistant", "content": content})
    return content

class RoleSetup(BaseModel):
    role: str

@app.post("/setup")
def setup_role(data: RoleSetup):
    global state, history, transcript
    
    # 1. Update the role and difficulty
    state.role = data.role
    state.question_number = 1  # Reset to question 1
    
    # 2. CLEAR the transcript for the new report
    transcript.clear() 
    
    # 3. REWRITE the system prompt with the NEW role
    # This is the "Brain Wash" that forces the AI to switch roles
    history = [{
        "role": "system", 
        "content": f"You are a professional interviewer. You are interviewing a candidate for the position of {state.role}. Focus on technical skills, industry knowledge, and behavioral fit for this specific role."
    }]
    
    print(f"✅ AI Brain Reset: Ready to interview for {state.role}")
    return {"status": "success", "role": state.role}

@app.get("/start")
def start_interview():
    print("DEBUG: /start called")
    q_prompt = question_prompt(state.role, state.difficulty, state.question_number)
    question = ask_ai(q_prompt)
    print("DEBUG: Question generated:", question)
    return {"question": question}



@app.post("/answer")
def submit_answer(answer: Answer):
    global state

    # 1. Get the last question asked
    # We look at the very last thing the Assistant said
    last_question = next((msg["content"] for msg in reversed(history) if msg["role"] == "assistant"), "No question found")

    transcript.append({
        "question": last_question,
        "answer": answer.text
    })
    # 2. Add the User's answer to the official AI history
    history.append({"role": "user", "content": f"My answer to '{last_question}' is: {answer.text}"})

    # 3. Get Evaluation
    e_prompt = evaluation_prompt(last_question, answer.text)
    evaluation = ask_ai(e_prompt)

    # 4. Progress the state
    state.question_number += 1

    if state.question_number > state.max_questions:
        return {"done": True, "evaluation": evaluation}

    # 5. Ask the NEXT question
    # We tell the AI: "Now ask the next question for a {role} at {difficulty} level"
    next_q_prompt = question_prompt(state.role, state.difficulty, state.question_number)
    next_question = ask_ai(next_q_prompt)

    return {
        "done": False,
        "evaluation": evaluation,
        "next_question": next_question
    }
@app.post("/end")
def end_interview():
    print(f"DEBUG: Transcript length: {len(transcript)}")
    print(f"DEBUG: Transcript content: {transcript}")
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

    append_to_report(transcript, final_data)
    # RUN THE AI CHECK
    ai_check_result = check_ai_content(transcript)
    
    final_data = json.loads(final_response.choices[0].message.content)
    final_data["role"] = state.role
    final_data["ai_detection"] = ai_check_result # Pass it to the report

    append_to_report(transcript, final_data),

    return {
        "status": "completed",
        "report": "PDF generated",
        "ai_score": ai_check_result['ai_probability']
    }
def check_ai_content(transcript):
    full_text = " ".join([entry['answer'] for entry in transcript])
    
    # We use a strict prompt to act as a forensic linguist
    prompt = f"""
    Analyze the following interview answers for signs of AI generation (e.g., ChatGPT).
    Look for: Overly formal structure, lack of specific personal experience, and generic terminology.
    
    TEXT: {full_text}
    
    Output JSON:
    - ai_probability (0-100)
    - reasoning (brief explanation)
    - human_markers (what sounds natural)
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)