import streamlit as st
import requests
import base64
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.agents.candidate_evaluation import send_evaluation_email
evaluation_result = None
import streamlit as st

if 'current_page' not in st.session_state:
    st.session_state.current_page = 'landing'
 
st.markdown("""
    <style>
    /* This only hides things when the screen is narrow (Mobile) */
    @media (max-width: 640px) {
        header {visibility: hidden;}
        footer {visibility: hidden;}
        .stDeployButton {display:none;}
    }
    
    /* Optional: Make buttons bigger and easier to tap with thumbs */
    div.stButton > button {
        width: 100%;
        border-radius: 10px;
        height: 3em;
        background-color: #007BFF;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

st.set_page_config(page_title="Agentic AI Screening App", layout="wide")
st.markdown("""
    <style>
    /* Hide the top header, hamburger menu, and footer */
    header {visibility: hidden;}
    footer {visibility: hidden;}
    #MainMenu {visibility: hidden;}
    
    /* Remove padding at the top of the page */
    .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
    }

    /* Make buttons big, round, and easy to tap with a thumb */
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 3.5em;
        font-weight: bold;
        border: none;
        background-color: #007BFF;
        color: white;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Prevent text selection (makes it feel less like a website) */
    * {
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    }

    </style>
    """, unsafe_allow_html=True)
st.title("AI Candidate Screening Agent")
st.markdown("Upload a **Resume** and a **Job Description** to evaluate the candidate's fit.")

col_a, col_b = st.columns(2)

with col_a:
    st.subheader("1. Candidate Resume")
    resume_file = st.file_uploader("Upload Resume (PDF)", type=["pdf"], key="resume_input")

with col_b:
    st.subheader("2. Job Description")
    jd_file = st.file_uploader("Upload Job Description (PDF)", type=["pdf"], key="jd_input")

if st.button("Analyze Candidate Fit"):
    if resume_file is not None and jd_file is not None:
        with st.spinner("AI Agents are parsing files and evaluating..."):
            try:
                files = {
                    "resume": (resume_file.name, resume_file.getvalue(), "application/pdf"),
                    "job_description": (jd_file.name, jd_file.getvalue(), "application/pdf")
                }

                response = requests.post("http://127.0.0.1:8000/screening/", files=files)

                if response.status_code == 200:
                    # 2. FIX: Assign the response to the variable used in your logic
                    evaluation_result = response.json()
                    
                    pdf_base64 = evaluation_result.get("pdf_base64")
                    if pdf_base64:
                            import base64
                            # 2. Define a local file path
                            local_pdf_path = "temp_report.pdf"
                            
                            # 3. Save the binary data to that path
                            with open(local_pdf_path, "wb") as f:
                                f.write(base64.b64decode(pdf_base64))
                            
                            # 4. NOW call the email function with the path and the data
                            success = send_evaluation_email(
                                file_path=local_pdf_path, 
                                eval_data=evaluation_result
                            )
                            
                            if success:
                                st.success("Evaluation email sent successfully!")
                                # Optional: Remove the temp file after sending
                                # os.remove(local_pdf_path)                    
                    st.divider()
                    m_col1, m_col2, m_col3 = st.columns(3)
                    
                    evaluation = evaluation_result.get("evaluation", {})
                    status = evaluation.get("candidate_status", "N/A")
                    if evaluation_result.get("pdf_base64"):
                        pdf_bytes = base64.b64decode(evaluation_result["pdf_base64"])
                    st.download_button(
                        label="Download Full Report",
                        data=pdf_bytes,
                        file_name="Candidate_Report.pdf",
                        mime="application/pdf"
                )
                    with m_col1:
                        if status == "Selected":
                            st.success(f"### Verdict: {status}")
                        else:
                            st.error(f"### Verdict: {status}")
                    
                    with m_col2:
                        st.metric("Skill Match", f"{evaluation.get('skill_match_percentage', 0)}%")
                    
                    with m_col3:
                        st.metric("Experience Found", f"{evaluation.get('experience', 0)} Years")
                        
                    st.subheader("Evaluation Reason")
                    st.info(evaluation.get("reason", "No detailed reason provided."))

                    # 3. FIX: Handle Email/PDF logic INSIDE this block
                    if "error" not in evaluation_result:
                        st.write("### Results are ready!")
                        
                        # Trigger email (Assuming function exists)
                        if success:
                            st.success("Evaluation sent to the hiring team!")
                            
                else:
                    st.error(f"Backend Error: {response.status_code} - {response.text}")

            except requests.exceptions.ConnectionError:
                st.error("Could not connect to the backend. Ensure server is running.")
    else:
        st.warning("Please upload both a resume and a job description before analyzing.")
col1, col2, col3 = st.columns(3)

