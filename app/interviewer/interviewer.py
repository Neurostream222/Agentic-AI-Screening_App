from openai import OpenAI
from state import InterviewState
from prompts import question_prompt, evaluation_prompt
from dotenv import load_dotenv
import json
from report_generator import append_to_report
import os
from pypdf import PdfReader, PdfWriter

load_dotenv()
client = OpenAI()
state = InterviewState()
transcript = []

# 1. Initialize a message history to maintain context
history = [{"role": "system", "content": f"You are an interviewer for a {state.role} position."}]

def ask_ai(prompt):
    # Add user prompt to history
    history.append({"role": "user", "content": prompt})
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=history,
    )
    
    content = response.choices[0].message.content.strip()
    # Add AI response to history so it remembers the flow
    history.append({"role": "assistant", "content": content})
    return content

print("AI Interview Started\n")

# Main Loop
while state.question_number <= state.max_questions:
    q_prompt = question_prompt(
        state.role,
        state.difficulty,
        state.question_number
    )
    
    question = ask_ai(q_prompt)
    print(f"\nQuestion {state.question_number}: {question}")

    answer = input("\nYour answer (or type 'end' to stop): ")
    
    if answer.lower() == "end":
        break

    e_prompt = evaluation_prompt(question, answer)
    evaluation = ask_ai(e_prompt)
    print("\nEvaluation:")
    print(evaluation)

    state.scores.append(evaluation)
    transcript.append({
        "question": question,
        "answer": answer
    })

    # 2. Logic Check: Adjust difficulty
    if any(score in evaluation for score in ["Knowledge: 8", "Knowledge: 9", "Knowledge: 10"]):
        state.difficulty = "hard"
    else:
        state.difficulty = "medium"

    state.question_number += 1

# 3. Final Summary Logic
print("\nFinalizing Interview...")

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
    response_format={ "type": "json_object" }
)

final_data = json.loads(final_response.choices[0].message.content)

# Add the role from your state object so the PDF knows what job this was for
final_data["role"] = state.role 

print("\nInterview Complete.")
# Pass both the conversation logs and the final scores
append_to_report(transcript, final_data)