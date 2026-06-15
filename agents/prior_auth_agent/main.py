import cohere
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import models
from typing import Dict, Any

# Mock payer policy database (in real-world this comes from payer APIs / PDFs)
payer_policies = {
    "MRI Brain": {"covered": True, "needs_docs": ["neurological symptoms", "physician referral"]},
    "Knee Replacement": {"covered": True, "needs_docs": ["X-ray results", "failed conservative therapy"]},
    "Genetic Testing": {"covered": False, "needs_docs": []},
}

def log_workflow_run(state: Dict[str, Any], db: Session):
    try:
        workflow_id = state.get("workflow_id", 0)
        run = (
            db.query(models.WorkflowRun)
            .filter(models.WorkflowRun.workflow_id == workflow_id)
            .first()
        )
        if run:
            run.current_step = "prior_auth"
            run.updated_at = text("CURRENT_TIMESTAMP")
            db.commit()
        print("Logged workflow run to database for workflow_id:", workflow_id)
    except Exception as e:
        print("Error logging workflow run:", str(e))

def log_prior_auth(details: Dict[str, Any], workflow_run_id: str,  db: Session):
    try:
        new_pa = models.PriorAuth(
            procedure_code=details.get("requested_procedure"),
            auth_number="PA" + str(details.get("requested_procedure")) + "001",  # Mock auth number
            status="Completed",
            created_at=text("CURRENT_TIMESTAMP"),
            updated_at=text("CURRENT_TIMESTAMP"),
            workflow_run_id=workflow_run_id
        )

        db.add(new_pa)
        db.commit()
        print("Logged prior authorization to database for procedure:", details.get("requested_procedure"))
    except Exception as e:
        print("Error logging prior authorization:", str(e))

def generate_prior_auth(clinical_note: str, procedure: str):
    """
    Generate PA request and predict approval likelihood
    
    OpenAI GPT-4 Example Prompt:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content

    """

    # Check mock policy rules
    policy = payer_policies.get(procedure, {"covered": False, "needs_docs": []})
    needs_docs = ", ".join(policy["needs_docs"]) if policy["needs_docs"] else "None"
    coverage_status = "Yes" if policy["covered"] else "No"

    prompt = f"""
    You are an AI assistant for prior authorization.
    Create a draft PA request for the procedure: {procedure}.
    
    Clinical note:
    {clinical_note}
    
    Payer policy:
    - Covered: {coverage_status}
    - Documentation required: {needs_docs}

    Output format:
    - Patient Clinical Summary
    - Requested Procedure
    - Justification (aligned with policy)
    - Predicted Approval Likelihood (%)

    Required JSON fields:
    {{
        "patient_summary": string,
        "requested_procedure": string,
        "justification": string,
        "approval_likelihood": float (0 to 1)
    }}
    """
    co = cohere.ClientV2()
    response = co.chat(
        model="command-r-plus-08-2024",
        messages=[{"role": "user", "content": prompt}],
    )

    res = response.message.content[0].text.strip()
    return json.loads(res)


def run_agent(db: Session, state: Dict[str, Any]) -> Dict[str, Any]:

    workflow_run_id = state.get("workflow_id", 0)

    clinical_note = """
    55-year-old male with chronic right knee pain for 3 years. 
    X-ray shows severe osteoarthritis. 
    Patient has failed conservative therapy (NSAIDs, PT, injections). 
    Functional limitation: unable to walk more than 50m without pain.
    """

    procedure = "Knee Replacement"
    pa_request = generate_prior_auth(clinical_note, procedure)

    print("=== AI-Generated Prior Authorization Request ===")
    print(pa_request)

    log_prior_auth(details=pa_request, workflow_run_id=workflow_run_id, db=db)
    log_workflow_run(state=state, db=db)

    state["prior_auth"] = pa_request
    return state