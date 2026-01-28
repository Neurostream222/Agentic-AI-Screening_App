from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from app.parsepdf import parse_pdf
from app.agents.resume_extractor_agent import extract_resume_info
from app.agents.jd_extractor_agent import analyze_jd
from app.agents.candidate_evaluation import evaluate_candidate
from app.utils import log_agent_data, generate_evaluation_pdf
import logging
import os
import base64 # Required for encoding the PDF into JSON
from app.agents.jd_extractor_agent import get_job_role, save_detected_role
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aigenxs.com", 
        "https://agentic-ai-screening-app.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/screening/")
async def upload_resume(
    resume: UploadFile, 
    job_description: UploadFile
):
    open("evaluations.json", 'w').close()  # Clear previous evaluations
    logger.info("!!! DEBUG: Request received at endpoint")

    # 1. Run Agents
    resume_text = parse_pdf(resume.file)
    resume_details_extracted = extract_resume_info(resume_text)
    
    jd_text = parse_pdf(job_description.file)
    jd_extracted = analyze_jd(jd_text)
    # Extract just the title (e.g., "Senior Business Analyst")
    # We pass jd_extracted (the result of the AI call) into the cleaning logic
    role_title = get_job_role(jd_extracted)

    # Save it to the Desktop so the Orchestrator can see it
    save_detected_role(role_title)

    evaluation_result = evaluate_candidate(resume_details_extracted, jd_extracted)
    
    # 2. Log Data
    logger.info("Running Resume Check...")
    log_agent_data(resume_details_extracted, "Resume_Agent")
    logger.info("Candidate Evaluation Complete.")
    log_agent_data(evaluation_result, "Evaluation_Agent")

    # 3. Generate PDF
    pdf_path = generate_evaluation_pdf()
    
    # 4. Prepare Unified Response (JSON + PDF)
    pdf_base64 = ""
    if pdf_path and os.path.exists(pdf_path):
        with open(pdf_path, "rb") as pdf_file:
            # Encode binary PDF to string so it fits in JSON
            pdf_base64 = base64.b64encode(pdf_file.read()).decode('utf-8')

    
    # Return everything as a dictionary (JSON)
    return {
        "resume": resume_details_extracted,
        "jd": jd_extracted,
        "evaluation": evaluation_result,
        "pdf_base64": pdf_base64,
        "report_generated": "Candidate_Report.pdf"
    }