from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from app.prompts.prompts import JD_EXTRACTION_PROMPT

# Load environment variables (API Keys)
load_dotenv()
client = OpenAI()

def analyze_jd(text: str) -> str:
    prompt = JD_EXTRACTION_PROMPT.format(jd_text=text)
    try:
        response = client.chat.completions.create(
            model="gpt-4o", # Using 4o for better JSON adherence
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except Exception as e:
        return json.dumps({"error": str(e)})

def get_job_role(text: str) -> str:
    raw_response = analyze_jd(text)
    try:
        # Strip markdown and parse JSON
        cleaned = raw_response.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        return data.get("job_title", "General Role")
    except:
        # Fallback if AI just returned a plain string
        return raw_response.strip().replace('"', '')

def save_detected_role(role_name):
    # This matches the path your orchestrator.py is looking for
    path = os.path.join(os.path.dirname(__file__), "current_role.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(role_name)
    print(f"✅ Handoff Successful: {role_name} saved to Desktop.")

# --- MAIN EXECUTION LOGIC ---
# This path must match exactly where your Screening App saves the text
