from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders
from app.prompts.prompts import CANDIDATE_EVALUATION_PROMPT
from datetime import datetime
from app.utils import log_agent_data

load_dotenv()
client = OpenAI()

# --- NEW UTILITY FUNCTIONS ---

def send_evaluation_email(file_path, eval_data):
    status = eval_data.get("candidate_status")
    """Sends the JSON file as an email attachment."""
    sender = "somaeshshivas@gmail.com"
    recipient = "clickshivas@gmail.com"
    password = "zyry inpk xicq wqvj" 

    try:
        msg = MIMEMultipart()
        msg['Subject'] = f"Evaluation: {eval_data.get('candidate_status', 'Update')}"
        msg['From'] = sender
        msg['To'] = recipient
        msg.attach(MIMEText(f"Status: {eval_data.get('candidate_status')}\nReason: {eval_data.get('reason')}", 'plain'))

        with open(file_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={file_path}")
            msg.attach(part)

        # Using port 465 with SSL
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            print("Connecting to Gmail server...")
            server.login(sender, password)
            print("Login successful!")
            server.send_message(msg)
            print("Email SENT successfully.")

    except smtplib.SMTPAuthenticationError:
        print("ERROR: Gmail Authentication failed. Check your App Password.")
    except Exception as e:
        print(f"ERROR: Email failed due to: {e}")

def send_document_request_email(candidate_email, candidate_name):
    sender = "somaeshshivas@gmail.com"
    password = "zyry inpk xicq wqvj"
    upload_link = "https://docs.google.com/forms/d/1FSbvAtXaKCSp4udcGO5mc4BS3ZsFlBqP1HR1jzLmstc/edit"
    schedule_link = "https://docs.google.com/forms/d/1JkLdBj-FIecm5TsEjW4w_-NvQIJSLxbBWPkBti2_Jq0/edit"

    msg = MIMEMultipart()
    msg['Subject'] = f"Action Required: Work Authorization for {candidate_name}"
    msg['From'] = sender
    msg['To'] = candidate_email

    body = f"""
    Hello {candidate_name},

    Congratulations! Based on our initial evaluation, we would like to proceed with your application.

    To move forward, we require the following documents for verification:
    1. A valid Government-issued ID.
    2. Proof of Work Authorization (Visa, Passport, etc.).

    Please upload these documents securely via the link below:
    {upload_link}

    Additionally, please schedule a time for your interview using the following link:
    {schedule_link}

    Regards,
    Recruitment Team
    """
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, password)
        server.send_message(msg)
    print(f"Document request sent to {candidate_email}")

# --- MAIN FUNCTION ---

def evaluate_candidate(candidate_details: str, jd: str) -> dict:
    # Use the prompt text you provided
    prompt = CANDIDATE_EVALUATION_PROMPT.format(resume_json=candidate_details, jd_json=jd)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0
        )

        clean_content = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
        evaluation_dict = json.loads(clean_content)
        print("🔍 FULL EVALUATION:", json.dumps(evaluation_dict, indent=2)) 
        status = evaluation_dict.get("candidate_status")
        json_file = "evaluations.json"
        # --- THE CONNECTION ---

        if status == "Selected":
            candidate_email = "clickshivas@gmail.com" 
            candidate_name = "Candidate" 
    
            send_document_request_email(candidate_email, candidate_name)
        else:
            print("Candidate rejected; no document request sent.")

        
        # 3. Send the email
        send_evaluation_email(json_file, evaluation_dict)

        return evaluation_dict

    except Exception as e:
            print(f"!!! CRITICAL ERROR: {e}") 
        
            return {"error": str(e), "resume": {"skills": []}, "candidate_status": "Error"}