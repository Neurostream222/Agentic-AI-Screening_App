import streamlit as st
import requests
import base64
import sys
import os

# 1. Path setup and imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from app.agents.candidate_evaluation import send_evaluation_email

# 2. MUST BE THE FIRST STREAMLIT COMMAND
st.set_page_config(page_title="Agentic AI Screening App", layout="wide")

# Initialize session state variables
if 'evaluation_result' not in st.session_state:
    st.session_state.evaluation_result = None

# Custom CSS for UI
st.markdown("""
    <style>
    header {visibility: hidden;}
    footer {visibility: hidden;}
    #MainMenu {visibility: hidden;}
    .block-container { padding-top: 1rem; padding-bottom: 1rem; }
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        height: 3.5em;
        font-weight: bold;
        background-color: #007BFF;
        color: white;
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
                # FIX: Define role_name before using it in the 'data' dict
                role_name = jd_file.name.replace(".pdf", "").replace("_", " ")
                
                data = {"role_name": role_name}
                files = {
                    "resume": (resume_file.name, resume_file.getvalue(), "application/pdf"),
                    "job_description": (jd_file.name, jd_file.getvalue(), "application/pdf")
                }

                # Using your Koyeb URL as per your original code
                response = requests.post("https://sore-pearl-aigenxs-433f8f8a.koyeb.app/screening/", files=files, data=data)

                if response.status_code == 200:
                    # Store result in session state to persist through reruns
                    st.session_state.evaluation_result = response.json()
                    st.success("Analysis complete!")
                else:
                    st.error(f"Backend Error: {response.status_code} - {response.text}")

            except requests.exceptions.ConnectionError:
                st.error("Could not connect to the backend. Ensure server is running.")
    else:
        st.warning("Please upload both files before analyzing.")

# Display results if they exist in session state
if st.session_state.evaluation_result:
    res = st.session_state.evaluation_result
    st.divider()
    
    evaluation = res.get("evaluation", {})
    status = evaluation.get("candidate_status", "N/A")
    
    # Download Button
    if res.get("pdf_base64"):
        pdf_bytes = base64.b64decode(res["pdf_base64"])
        st.download_button(
            label="Download Full Report",
            data=pdf_bytes,
            file_name="Candidate_Report.pdf",
            mime="application/pdf"
        )

    # Metrics
    m_col1, m_col2, m_col3 = st.columns(3)
    with m_col1:
        if status == "Selected":
            st.success(f"### Verdict: {status}")
        else:
            st.error(f"### Verdict: {status}")
    with m_col2:
        st.metric("Skill Match", f"{evaluation.get('skill_match_percentage', 0)}%")
    with m_col3:
        st.metric("Experience", f"{evaluation.get('experience', 0)} Years")
    
    st.subheader("Evaluation Reason")
    st.info(evaluation.get("reason", "No detailed reason provided."))
