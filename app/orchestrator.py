from prefect import flow, task
from app.interviewer.actions import initialize_session

@task
def update_interviewer(role):
    # This initializes the interview session for the candidate
    initialize_session(role)

@flow(name="hiring-pipeline")
def hiring_pipeline(role_title: str):
    """
    This function ONLY handles the role_title. 
    It is called by main.py after the JD is parsed.
    """
    update_interviewer(role_title)
    return True