import cohere
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import models
from typing import Dict, Any

# Mock payer claim rules (in real-world this comes from payer APIs / PDFs)
payer_claim_rules = {
    "MRI Brain": {
        "required_fields": ["diagnosis_code", "procedure_code", "physician_signature"],
        "denial_reasons": ["missing documentation", "invalid diagnosis code"],
    },
    "Knee Replacement": {
        "required_fields": ["diagnosis_code", "procedure_code", "operative_report", "pre-op clearance"],
        "denial_reasons": ["incomplete operative report", "missing pre-op clearance"],
    },
    "Genetic Testing": {
        "required_fields": ["diagnosis_code", "procedure_code", "genetic counseling note"],
        "denial_reasons": ["not medically necessary", "missing counseling note"],
    },
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
            run.current_step = "claim_scrubbing"
            run.updated_at = text("CURRENT_TIMESTAMP")
            db.commit()
        print("Logged workflow run to database for workflow_id:", workflow_id)
    except Exception as e:
        print("Error logging workflow run:", str(e))

def log_claim_scrubbed(details: Dict[str, Any], workflow_run_id: str, db: Session):
    try:
        new_claim_scrub = models.ClaimsScrubbing(
            procedure_code=details["claim"].get("procedure_code"),
            diagnosis_code=details["claim"].get("diagnosis_code"),
            operative_report=details["claim"].get("operative_report"),
            pre_op_clearance=details["claim"].get("pre-op_clearance"),
            physician_signature=details["claim"].get("physician_signature"),
            status=details.get("status"),
            # You may want to store issues as a string or JSON
            # If you have an 'issues' column, otherwise remove this
            created_at=text("CURRENT_TIMESTAMP"),
            updated_at=text("CURRENT_TIMESTAMP"),
            workflow_run_id=workflow_run_id
        )

        db.add(new_claim_scrub)
        db.commit()
        print("Logged claim scrubbed to database for procedure:", details.get("procedure"))
    except Exception as e:
        print("Error logging claim scrubbed:", str(e))


def scrub_claim(claim: Dict[str, Any], procedure: str) -> Dict[str, Any]:
    """
    Scrub claim for completeness and compliance with payer rules.
    Returns a dict with status and issues found.
    """
    rules = payer_claim_rules.get(procedure, {"required_fields": [], "denial_reasons": []})
    missing_fields = [field for field in rules["required_fields"] if field not in claim or not claim[field]]
    issues = []

    if missing_fields:
        issues.append(f"Missing fields: {', '.join(missing_fields)}")

    # Example: check for invalid diagnosis code format (mock logic)
    if "diagnosis_code" in claim and not claim["diagnosis_code"].startswith("M"):
        issues.append("Diagnosis code does not match expected format (should start with 'M').")

    status = "Clean" if not issues else "Issues Found"
    return {
        "status": status,
        "issues": issues,
        "claim": claim,
        "procedure": procedure,
    }

def run_agent(db: Session, state: Dict[str, Any]) -> Dict[str, Any]:

    workflow_run_id = state.get("workflow_id", 0)

    # Example claim data
    claim = {
        "diagnosis_code": "M17.11",
        "procedure_code": "27447",
        "operative_report": "Attached",
        "pre-op_clearance": "Attached",
        "physician_signature": "Dr. Smith",
    }
    procedure = "Knee Replacement"
    scrubbed = scrub_claim(claim, procedure)

    print("=== Claims Scrubbing Agent Output ===")
    print(json.dumps(scrubbed, indent=2))

    log_claim_scrubbed(details=scrubbed, workflow_run_id=workflow_run_id, db=db)
    log_workflow_run(state=state, db=db)

    state["scrubbed_claim"] = scrubbed
    return state

