import os
import io
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from pypdf import PdfReader, PdfWriter

def append_to_report(transcript, final_data):
    # 1. Setup Path
    target_path = Path(__file__).parent.parent / "Candidate_Report.pdf"
    target_path.parent.mkdir(parents=True, exist_ok=True)

    # 2. Generate the NEW content
    packet = io.BytesIO()
    doc = SimpleDocTemplate(packet, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title & Scores
    role_name = final_data.get('role', 'Senior Business Analyst')
    story.append(Paragraph(f"<b>Interview Report: {role_name}</b>", styles['Title']))
    story.append(Spacer(1, 12))
    
    score_text = f"""
    <b>Communication:</b> {final_data.get('communication_score', 0)}/10<br/>
    <b>Knowledge:</b> {final_data.get('knowledge_score', 0)}/10<br/>
    <b>Confidence:</b> {final_data.get('confidence_score', 0)}/10
    """
    story.append(Paragraph(score_text, styles['Normal']))
    story.append(Spacer(1, 12))

    # Strengths
    story.append(Paragraph("<b>Key Strengths:</b>", styles['Heading3']))
    for s in final_data.get('strengths', []):
        story.append(Paragraph(f"• {s}", styles['Normal']))
    story.append(Spacer(1, 12))

    # AI Detection - Logic Fix: 
    # This pulls the 'real' work from the AI Checker
    ai_data = final_data.get('ai_detection', {})
    prob = ai_data.get('ai_probability', "0")
    reason = ai_data.get('reasoning', "Analysis completed.")

    story.append(Paragraph("<b>AI Integrity Check:</b>", styles['Heading3']))
    story.append(Paragraph(f"Probability of AI Generation: {prob}%", styles['Normal']))
    story.append(Paragraph(f"Reasoning: {reason}", styles['Normal']))
    story.append(Spacer(1, 12))

    # TRANSCRIPT SECTION
    story.append(Paragraph("<b>Full Interview Transcript:</b>", styles['Heading3']))
    story.append(Spacer(1, 8))

    for i, entry in enumerate(transcript, 1):
        story.append(Paragraph(f"<b>Q{i}:</b> {entry['question']}", styles['Normal']))
        story.append(Paragraph(f"<b>A:</b> <i>{entry['answer']}</i>", styles['Normal']))
        story.append(Spacer(1, 10))

    # Build the temporary PDF buffer
    doc.build(story)
    packet.seek(0)
    new_pdf = PdfReader(packet)

    # 3. Merge Logic
    writer = PdfWriter()

    # Read the Screening Report if it already exists
    if target_path.exists():
        try:
            reader = PdfReader(str(target_path))
            for page in reader.pages:
                writer.add_page(page)
        except Exception as e:
            print(f"Note: Creating new report as existing one couldn't be read: {e}")

    # Add the Interview pages
    for page in new_pdf.pages:
        writer.add_page(page)

    # 4. SINGLE WRITE CALL (Crucial Fix)
    # This replaces the three redundant 'with open' blocks you had
    try:
        with open(target_path, "wb") as f:
            writer.write(f)
            f.flush()
            os.fsync(f.fileno())
        print(f"✅ Successfully appended Interview Results to: {target_path}")
    except PermissionError:
        print("❌ ERROR: Could not write PDF. Close the PDF file if it is open in another program!")

    # Final Verification
    final_check = PdfReader(str(target_path))
    print(f"VERIFICATION: The PDF now has {len(final_check.pages)} pages total.")