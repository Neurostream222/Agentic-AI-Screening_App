from prefect import flow, task
from app.interviewer.actions import initialize_session
# Import these so the orchestrator can actually do the work
from app.parsepdf import parse_pdf
from app.agents.resume_extractor_agent import extract_resume_info
from app.agents.jd_extractor_agent import analyze_jd
from app.agents.candidate_evaluation import evaluate_candidate
from app.utils import generate_evaluation_pdf
import base64
import os

@task
def update_interviewer(role):
    initialize_session(role)

@flow(name="hiring-pipeline")
def hiring_pipeline(role_title, resume_file, jd_file):
    # 1. Parse the files (Extracting text for the report)
    resume_text = parse_pdf(resume_file)
    jd_text = parse_pdf(jd_file)

    # 2. Run your existing Agent logic
    resume_details = extract_resume_info(resume_text)
    jd_extracted = analyze_jd(jd_text)
    evaluation_result = evaluate_candidate(resume_details, jd_extracted)

    # 3. Update the interviewer session
    update_interviewer(role_title)

    # 4. Generate the PDF
    pdf_path = generate_evaluation_pdf()
    pdf_base64 = ""
    if pdf_path and os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            pdf_base64 = base64.b64encode(f.read()).decode('utf-8')

    # 5. RETURN the data so the UI can see it
    return {
        "evaluation": evaluation_result,
        "pdf_base64": pdf_base64
    }