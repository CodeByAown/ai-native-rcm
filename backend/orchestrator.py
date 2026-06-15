"""
Orchestrator: runs the RCM workflow by invoking each agent in-process.

Previously each agent was a separate container reached over HTTP. They are now
imported and called directly, so there is no inter-service networking, no shared
filesystem requirement, and no message broker.
"""
import uuid
from typing import Dict, Any

from langgraph.checkpoint.memory import InMemorySaver
from sqlalchemy import text
from sqlalchemy.orm import Session

from deps import RCMState
from workflows import build_workflow
from database import SessionLocal

import agent_eligibility
import agent_prior_auth
import agent_clinical_doc
import agent_medical_coding
import agent_claim_scrubbing
import agent_claim_submission


def log_workflow_run(workflow_type: str, status: str, workflow_id: str, thread_id: str, db: Session):
    try:
        db.execute(
            text(
                "INSERT INTO workflow_runs (workflow_id, thread_id, workflow_type, status, created_at, updated_at) "
                "VALUES (:workflow_id, :thread_id, :workflow_type, :status, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"workflow_id": workflow_id, "thread_id": thread_id, "workflow_type": workflow_type, "status": status},
        )
        db.commit()
        print("Logged workflow run to database.")
    except Exception as e:
        print("Error logging workflow run:", str(e))


def _run_agent_node(agent_module, state: RCMState) -> RCMState:
    """Call an agent's run_agent with a fresh DB session, returning the state."""
    db = SessionLocal()
    try:
        return agent_module.run_agent(db=db, state=state)
    finally:
        db.close()


def eligibility_task(state: RCMState) -> RCMState:
    return _run_agent_node(agent_eligibility, state)


def prior_auth_task(state: RCMState) -> RCMState:
    return _run_agent_node(agent_prior_auth, state)


def clinical_doc_task(state: RCMState) -> RCMState:
    return _run_agent_node(agent_clinical_doc, state)


def medical_coding_task(state: RCMState) -> RCMState:
    return _run_agent_node(agent_medical_coding, state)


def claim_scrubbing_task(state: RCMState) -> RCMState:
    return _run_agent_node(agent_claim_scrubbing, state)


def claim_submission_task(state: RCMState) -> RCMState:
    return _run_agent_node(agent_claim_submission, state)


def task_registry() -> Dict[str, Any]:
    return {
        "eligibility": eligibility_task,
        "clinical_doc": clinical_doc_task,
        "prior_auth": prior_auth_task,
        "medical_coding": medical_coding_task,
        "claim_scrubbing": claim_scrubbing_task,
        "claim_submission": claim_submission_task,
    }


def rcm_pipeline(steps, workflow_type: str, file_path: str, db: Session) -> RCMState:
    """
    Run an RCM workflow based on the selected steps.

    Lets us run different workflows based on user needs.
    """
    state = {"workflow_type": workflow_type, "success": True, "retry_count": 0, "file_path": file_path}
    workflow = build_workflow(steps, task_registry())

    memory = InMemorySaver()
    app = workflow.compile(checkpointer=memory)

    id = str(uuid.uuid4())
    thread_id = f"rcm_thread_{id}"

    state["workflow_id"] = id
    state["thread_id"] = thread_id

    log_workflow_run(workflow_type=workflow_type, status="started", workflow_id=id, thread_id=thread_id, db=db)

    final_state = app.invoke(state, config={"configurable": {"thread_id": thread_id}})
    return final_state
