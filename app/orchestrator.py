from app.interviewer.actions import initialize_session

def hiring_pipeline(role_title: str):
    initialize_session(role_title)
    return True