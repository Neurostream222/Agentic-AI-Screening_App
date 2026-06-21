from fastapi import FastAPI, UploadFile, File, Form
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
from app.orchestrator import hiring_pipeline
from app.interviewer.api import router as interview_router
import json
app = FastAPI()
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(interview_router, prefix="/interview")
@app.post("/screening/")
async def upload_resume(
    resume: UploadFile, 
    job_description: UploadFile,
    role_name: str = Form(...)
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
    hiring_pipeline(role_title)

    # Save it to the Desktop so the Orchestrator can see it
    logger.info(f"Orchestrator will use role: {role_title}")


    evaluation_result = evaluate_candidate(resume_details_extracted, jd_extracted)
    
    # 2. Log Data
    logger.info("Running Resume Check...")
    log_agent_data(resume_details_extracted, "Resume_Agent")
    logger.info("Candidate Evaluation Complete.")
    log_agent_data(evaluation_result, "Evaluation_Agent")

    # 3. Generate PDF
    pdf_data = [
    {"agent": "Resume_Agent", "results": resume_details_extracted},
    {"agent": "Evaluation_Agent", "results": evaluation_result}
    ]
    pdf_path = generate_evaluation_pdf(pdf_data)
    
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
@app.post("/ranking/")
async def rank_candidates(
    resumes: list[UploadFile] = File(...),
    job_description: UploadFile = File(...),
):
    from app.agents.candidate_evaluation import compare_candidates
    import re

    jd_text = parse_pdf(job_description.file)
    jd_extracted = analyze_jd(jd_text)

    results = []
    for resume in resumes:
        resume_text = parse_pdf(resume.file)
        resume_details = extract_resume_info(resume_text)
        evaluation = evaluate_candidate(resume_details, jd_extracted)

        parsed_resume = resume_details
        if isinstance(resume_details, dict) and resume_details.get('error'):
            try:
                cleaned = re.sub(r'```json\n?|```', '', resume_details['raw_payload']).strip()
                parsed_resume = json.loads(cleaned)
            except:
                parsed_resume = {}

        results.append({
            "name": parsed_resume.get('name', resume.filename),
            "score": evaluation.get('match_score', 0),
            "verdict": evaluation.get('candidate_status', 'Unknown'),
            "reasoning": evaluation.get('reasoning', ''),
            "experience": parsed_resume.get('work_experience', 0),
            "scorecard": evaluation.get('scorecard', {}),
            "red_flags": evaluation.get('red_flags', []),
            "interview_questions": evaluation.get('interview_questions', []),
            "matched_skills": evaluation.get('gap_analysis', {}).get('matched_skills', []),
            "hard_gaps": evaluation.get('gap_analysis', {}).get('hard_gaps', []),
            "upskill_potential": evaluation.get('upskill_potential', ''),
        })

    results.sort(key=lambda x: x['score'], reverse=True)

    # Head-to-head comparison pass
    comparison = compare_candidates(results, jd_extracted)
    ranking_map = {r['name']: r for r in comparison.get('final_ranking', [])}
    for c in results:
        meta = ranking_map.get(c['name'], {})
        c['rank'] = meta.get('rank', results.index(c) + 1)
        c['decisive_reason'] = meta.get('decisive_reason', '')
        c['hire_confidence'] = meta.get('hire_confidence', 'Medium')

    results.sort(key=lambda x: x['rank'])

    return {
        "ranked_candidates": results,
        "recruiter_note": comparison.get('recruiter_note', '')
    }
def run_full_screening(resume_file, jd_file):
    # 1. Clear previous data
    open("evaluations.json", 'w').close() 

    # 2. Parse and Extract (Your existing logic)
    resume_text = parse_pdf(resume_file)
    resume_details = extract_resume_info(resume_text)
    
    jd_text = parse_pdf(jd_file)
    jd_extracted = analyze_jd(jd_text)
    
    # 3. Handle the Orchestrator Bridge
    role_title = get_job_role(jd_extracted)
    hiring_pipeline(role_title) # This sends JUST the title to orchestrator.py

    # 4. Evaluate and Generate PDF
    evaluation_result = evaluate_candidate(resume_details, jd_extracted)
    pdf_data = [
        {"agent": "Resume_Agent", "results": resume_details},
        {"agent": "Evaluation_Agent", "results": evaluation_result}
    ]
    pdf_path = generate_evaluation_pdf(pdf_data)
    
    # 5. Prepare the response for Streamlit
    pdf_base64 = ""
    if pdf_path and os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            pdf_base64 = base64.b64encode(f.read()).decode('utf-8')

    return {
        "resume": resume_details,
        "jd": jd_extracted,
        "evaluation": evaluation_result,
        "pdf_base64": pdf_base64
    }