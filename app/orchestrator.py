from prefect import flow, task
from app.interviewer.actions import initialize_session

#@task
def update_interviewer(role):
    # This now works on Koyeb because it's an internal function call!
    initialize_session(role)

#@flow(name="hiring-pipeline")
def hiring_pipeline(role_title: str):
    update_interviewer(role_title)