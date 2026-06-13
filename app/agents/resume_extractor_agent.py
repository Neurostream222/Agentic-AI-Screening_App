from openai import OpenAI 

import os
from dotenv import load_dotenv
from app.prompts.prompts import RESUME_EXTRACTION_PROMPT
from app.utils import log_agent_data
import json
#Load Env Variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

#Initialize OpenAI Client
client = OpenAI(api_key=OPENAI_API_KEY)
def extract_resume_info(resume_text):
    prompt=RESUME_EXTRACTION_PROMPT.format(resume_text=resume_text)
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts structured information from resumes."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1500,
        temperature=0.2,
    )
    print("Response from OpenAI:", response.choices[0].message.content)
    raw_text = response.choices[0].message.content

    try:
        # This turns the "string" into a "dictionary"
        data_dict = json.loads(raw_text)
        return data_dict
    except json.JSONDecodeError:
        # If OpenAI sends back bad formatting, this prevents a crash
        print("Error: OpenAI did not return valid JSON")
        return {"error": "Invalid JSON response", "raw_payload": raw_text}