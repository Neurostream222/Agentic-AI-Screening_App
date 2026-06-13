import streamlit as st
import base64
import sys
import os

# 1. Force the Project Root into the path
current_dir = os.path.dirname(os.path.abspath(__file__)) # app/ui
app_dir = os.path.dirname(current_dir)                   # app
root_dir = os.path.dirname(app_dir)                      # project_root

for p in [root_dir, app_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

# 2. Try every possible import style
try:
    from app.main import run_full_screening
except ImportError:
    try:
        from main import run_full_screening
    except ImportError as e:
        st.error(f"Logic Load Failure: {e}")
        st.write(f"I looked in: {sys.path[:3]}")

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

# --- ANALYSIS BLOCK ---
if st.button("Analyze Candidate Fit"):
    if resume_file and jd_file:
        with st.spinner("AI Agents are analyzing directly on the server..."):
            try:
                # Direct local call - No more 503/504 errors!
                # Ensure hiring_pipeline returns a DICTIONARY
                role_name = jd_file.name.replace(".pdf", "")
                
                result = run_full_screening(resume_file, jd_file)
                
                if result:
                    st.session_state.evaluation_result = result
                    st.success("Analysis complete!")
                else:
                    st.error("The analysis returned no results.")
                    
            except Exception as e:
                st.error(f"An error occurred during analysis: {e}")
    else:
        st.warning("Please upload both files before analyzing.")

# --- DISPLAY RESULTS ---
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
        st.metric("Skill Match", f"{evaluation.get('match_score', 0)}%")
    with m_col3:
        st.metric("Experience", f"{res.get('resume', {}).get('work_experience', 0)} Years")
    
    st.subheader("Evaluation Reason")
    st.info(evaluation.get("reasoning", "No detailed reason provided."))