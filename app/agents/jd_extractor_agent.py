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
    path = r"C:\Users\somae\OneDrive\Desktop\current_role.txt"
    with open(path, "w", encoding="utf-8") as f:
        f.write(role_name)
    print(f"✅ Handoff Successful: {role_name} saved to Desktop.")

# --- MAIN EXECUTION LOGIC ---
# This path must match exactly where your Screening App saves the text
current_file_to_analyze = r"C:\Users\somae\OneDrive\Desktop\Agentic-AI-Screening_App\app\temp\latest_upload.txt"

if os.path.exists(current_file_to_analyze):
    with open(current_file_to_analyze, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We only run these if 'content' was successfully read
    if content.strip():
        detected_role = get_job_role(content)
        save_detected_role(detected_role)
    else:
        print("⚠️ Warning: The file was found but it is empty.")
else:
    print(f"❌ Error: File not found at {current_file_to_analyze}")
    print("Check if your Screening App is actually saving the text to that temp folder.")