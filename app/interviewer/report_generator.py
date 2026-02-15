import os
import io
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from pypdf import PdfReader, PdfWriter

def append_to_report(transcript, final_data, screening_data=None):
    # 1. Setup Path - Use a simple name in the root directory for Streamlit Cloud
    target_path = Path("interview_report.pdf") 

    # 2. Generate content
    packet = io.BytesIO()
    doc = SimpleDocTemplate(packet, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # --- SECTION 1: SCREENING DATA (From Page 1) ---
    if screening_data:
        eval_info = screening_data.get("evaluation", {})
        story.append(Paragraph("<b>PART 1: INITIAL SCREENING EVALUATION</b>", styles['Title']))
        story.append(Spacer(1, 12))
        
        screening_text = f"""
        <b>Skill Match:</b> {eval_info.get('skill_match_percentage', 'N/A')}%<br/>
        <b>Experience:</b> {eval_info.get('experience', 'N/A')} Years<br/>
        <b>Verdict:</b> {eval_info.get('candidate_status', 'N/A')}
        """
        story.append(Paragraph(screening_text, styles['Normal']))
        story.append(Paragraph(f"<b>Reasoning:</b> {eval_info.get('reason', '')}", styles['Normal']))
        story.append(Spacer(1, 24))
        story.append(Paragraph("<hr/>", styles['Normal'])) # Divider line

    # --- SECTION 2: INTERVIEW DATA (Current Page) ---
    role_name = final_data.get('role', 'Technical Candidate')
    story.append(Paragraph(f"<b>PART 2: INTERVIEW REPORT - {role_name}</b>", styles['Title']))
    story.append(Spacer(1, 12))
    
    # ... (Keep your existing Score, Strengths, and AI Detection logic here) ...
    # [Your existing code for communication_score, strengths, etc.]

    # --- SECTION 3: TRANSCRIPT ---
    story.append(Paragraph("<b>Full Interview Transcript:</b>", styles['Heading3']))
    for i, entry in enumerate(transcript, 1):
        story.append(Paragraph(f"<b>Q{i}:</b> {entry['question']}", styles['Normal']))
        story.append(Paragraph(f"<b>A:</b> <i>{entry['answer']}</i>", styles['Normal']))
        story.append(Spacer(1, 10))

    # 3. Build and Write
    doc.build(story)
    packet.seek(0)
    
    with open(target_path, "wb") as f:
        f.write(packet.read())
    
    print(f"✅ Successfully generated Unified Report at: {target_path}")
    return target_path