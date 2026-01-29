from openai import OpenAI
import os
import json
from app.interviewer.state import interview_state
from app.interviewer.prompts import question_prompt, evaluation_prompt
from app.interviewer.report_generator import append_to_report

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Global memory for the current session
history = []
transcript = []

def ask_ai(prompt):
    global history
    history.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history
    )
    content = response.choices[0].message.content.strip()
    history.append({"role": "assistant", "content": content})
    return content

def initialize_session(role_title):
    """Called by Orchestrator to prime the session"""
    global history, transcript
    interview_state.role = role_title
    interview_state.question_number = 1
    transcript.clear() 
    history = [{
        "role": "system", 
        "content": f"You are a professional interviewer for the {role_title} position."
    }]
    return {"status": "success"}

def start_interview_logic():
    """Called by UI when the page loads"""
    q_prompt = question_prompt(interview_state.role, interview_state.difficulty, interview_state.question_number)
    question = ask_ai(q_prompt)
    return {"question": question}

def submit_answer_logic(answer_text):
    """Called by UI when user hits send"""
    # 1. Identify the last question asked
    last_question = next((msg["content"] for msg in reversed(history) if msg["role"] == "assistant"), "No question found")

    transcript.append({"question": last_question, "answer": answer_text})
    
    # 2. Get AI Evaluation
    e_prompt = evaluation_prompt(last_question, answer_text)
    evaluation = ask_ai(e_prompt)

    # 3. Progress State
    interview_state.question_number += 1

    if interview_state.question_number > interview_state.max_questions:
        return {"done": True, "evaluation": evaluation}

    # 4. Get next question
    next_q_prompt = question_prompt(interview_state.role, interview_state.difficulty, interview_state.question_number)
    next_question = ask_ai(next_q_prompt)

    return {
        "done": False,
        "evaluation": evaluation,
        "next_question": next_question
    }

def end_interview_logic():
    """Called by UI to finish and generate report"""
    final_prompt = "End the interview and output JSON with scores and feedback."
    
    final_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history + [{"role": "user", "content": final_prompt}],
        response_format={"type": "json_object"}
    )

    final_data = json.loads(final_response.choices[0].message.content)
    final_data["role"] = interview_state.role
    
    # Note: Ensure append_to_report handles local file paths correctly on Koyeb
    append_to_report(transcript, final_data)
    
    return {"status": "completed", "data": final_data}
def check_ai_content(transcript_data):
    full_text = " ".join([entry['answer'] for entry in transcript_data])
    prompt = f"Analyze the following interview answers for signs of AI generation... TEXT: {full_text}"
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)