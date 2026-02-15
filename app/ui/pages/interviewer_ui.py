import streamlit as st
import cv2
from streamlit_webrtc import webrtc_streamer, VideoTransformerBase
from app.interviewer.state import interview_state
from app.interviewer.actions import start_interview_logic, submit_answer_logic, end_interview_logic
import os

# MUST BE FIRST AND ONLY ONCE
st.set_page_config(page_title="AI Technical Interview", page_icon="🎙️", layout="wide")


# --- Video Proctoring Logic ---
class FaceInFrameTransformer(VideoTransformerBase):
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def transform(self, frame):
        img = frame.to_ndarray(format="bgr24")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 10)

        if len(faces) == 0:
            cv2.putText(img, "WARNING: STAY IN FRAME", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.rectangle(img, (0, 0), (img.shape[1], img.shape[0]), (0, 0, 255), 10)
        else:
            cv2.rectangle(img, (0, 0), (img.shape[1], img.shape[0]), (0, 255, 0), 10)
        return img

# --- Combined Sidebar ---
with st.sidebar:
    st.header("📸 Candidate Monitor")
    st.info("Keep your face in the green box.")
    webrtc_streamer(key="proctoring", video_transformer_factory=FaceInFrameTransformer)
    
    st.divider()
    st.header("📊 Interview Progress")
    if "transcript" not in st.session_state:
        st.session_state.transcript = []
    
    # Scrollable container for transcript so it doesn't take up the whole sidebar
    with st.container(height=400):
        for i, entry in enumerate(st.session_state.transcript, 1):
            st.write(f"**Q{i}:** {entry['question'][:50]}...")
            st.write(f"**A:** {entry['answer'][:50]}...")
            st.divider()

# --- Main Chat UI ---
st.title(f"🎙️ Technical Interview: {interview_state.role}")

if "messages" not in st.session_state:
    st.session_state.messages = []
    try:
        response = start_interview_logic() 
        first_q = response.get("question", "Ready to start?")
        st.session_state.messages.append({"role": "assistant", "content": first_q})
    except Exception as e:
        st.error(f"Backend not responding: {e}")

# Display Chat History
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Handle User Input
if prompt := st.chat_input("Enter your response..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.spinner("Thinking..."):
        try:
            res = submit_answer_logic(prompt)
            
            # Map transcript
            last_q = st.session_state.messages[-2]["content"] if len(st.session_state.messages) > 1 else "Opening"
            st.session_state.transcript.append({"question": last_q, "answer": prompt})

            if res.get("done"):
                st.success("Interview Finished!")
                st.session_state.done = True
            else:
                next_q = res.get("next_question")
                st.session_state.messages.append({"role": "assistant", "content": next_q})
                st.rerun() # Refresh to show new AI question
        except Exception as e:
            st.error(f"Error: {e}")

# Report Generation
if st.session_state.get("done"):
    st.divider()
    st.info("Interview complete. The final report has been generated for review.")
    
    recruiter_code = st.text_input("Enter Recruiter Access Code to unlock download", type="password")

    if st.button("📄 Prepare Final Report"):
        if recruiter_code == "SECRET123": 
            with st.spinner("Processing PDF..."):
                # 1. Trigger the logic
                end_res = end_interview_logic()
                
                # 2. Use an absolute path to find the file in the project root
                # This goes up levels from app/ui/pages/ to the main project folder
                base_path = os.path.abspath(os.getcwd())
                report_path = os.path.join(base_path, "interview_report.pdf")
                
                if os.path.exists(report_path):
                    with open(report_path, "rb") as f:
                        pdf_data = f.read()
                    
                    st.balloons()
                    st.success("✅ Access Granted: Report is ready!")
                    
                    st.download_button(
                        label="📥 Download Full Interview Report",
                        data=pdf_data,
                        file_name=f"Report_{interview_state.role}.pdf",
                        mime="application/pdf"
                    )
                else:
                    # Debugging: Show the app where it's looking so you can fix the backend
                    st.error(f"File not found at: {report_path}")
                    st.info("Ensure your backend 'end_interview_logic' saves the file to the project root.")
        elif recruiter_code:
            st.error("🚫 Unauthorized access code."