import cohere
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import models
from typing import Dict, Any
import uuid
import datetime

# Mock payer claim rules (in real-world this comes from payer APIs / PDFs)
payer_claim_rules = {
    "Knee Replacement": {
        "covered": True,
        "required_codes": ["27447", "M17.11"],
        "required_docs": ["operative report", "discharge summary"]
    },
    "MRI Brain": {
        "covered": True,
        "required_codes": ["70551", "G93.9"],
        "required_docs": ["radiology report"]
    },
    "Genetic Testing": {
        "covered": False,
        "required_codes": [],
        "required_docs": []
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
            run.current_step = "claim_submission"
            run.updated_at = text("CURRENT_TIMESTAMP")
            db.commit()
        print("Logged workflow run to database for workflow_id:", workflow_id)
    except Exception as e:
        print("Error logging workflow run:", str(e))

def log_claim_submission(details: Dict[str, Any], workflow_run_id: str, db: Session):
    try:
        new_claim = models.Claim(
            claim_id=details.get("claim_id"),
            procedure_performed=details.get("procedure_performed"),
            codes=json.dumps(details.get("codes", [])),
            documentation=json.dumps(details.get("documentation", [])),
            payer=json.dumps(details.get("payer", {})),
            provider=json.dumps(details.get("provider", {})),
            submission_date=details.get("submission_date"),
            submission_status=details.get("submission_status"),
            tracking_id=details.get("tracking_id"),
            patient_summary=details.get("patient_summary"),
            status="pending",
            created_at=text("CURRENT_TIMESTAMP"),
            updated_at=text("CURRENT_TIMESTAMP"),
            workflow_run_id=workflow_run_id
        )

        db.add(new_claim)
        db.commit()
        print("Logged claim submission to database for claim_id:", details.get("claim_id"))
    except Exception as e:
        print("Error logging claim submission:", str(e))

def generate_claim_submission(clinical_note: str, procedure: str) -> Dict[str, Any]:
    """
    Generate a draft claim submission package and simulate payer acknowledgment.
    """

    # Lookup payer rules
    claim_rule = payer_claim_rules.get(procedure, {"covered": False, "required_codes": [], "required_docs": []})
    required_codes = claim_rule["required_codes"]
    required_docs = claim_rule["required_docs"]

    # Build AI prompt to structure claim
    prompt = f"""
    You are an AI assistant that prepares healthcare claim submissions.
    Create a JSON claim submission package for the procedure: {procedure}.
    
    Clinical note:
    {clinical_note}
    
    Payer claim rules:
    - Covered: {"Yes" if claim_rule["covered"] else "No"}
    - Required codes: {", ".join(required_codes) if required_codes else "None"}
    - Required documentation: {", ".join(required_docs) if required_docs else "None"}

    Required JSON fields:
    {{
        "claim_id": string,  # unique identifier
        "patient_summary": string,
        "procedure_performed": string,
        "codes": list of strings,
        "documentation": list of strings,
        "payer": {{
            "name": "Mock Insurance Co",
            "payer_id": "MOCK123"
        }},
        "provider": {{
            "name": "Dr. John Doe",
            "npi": "1234567890"
        }},
        "submission_date": string (ISO format),
        "submission_status": string ("accepted" or "rejected"),
        "tracking_id": string  # mock payer tracking ID
    }}
    """

    co = cohere.ClientV2()
    response = co.chat(
        model="command-r-plus-08-2024",
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        res = response.message.content[0].text.strip()
        claim = json.loads(res)
    except Exception as e:
        # fallback if model gives bad JSON
        claim = {
            "claim_id": str(uuid.uuid4()),
            "patient_summary": clinical_note[:100] + "...",
            "procedure_performed": procedure,
            "codes": required_codes,
            "documentation": required_docs,
            "payer": {"name": "Mock Insurance Co", "payer_id": "MOCK123"},
            "provider": {"name": "Dr. John Doe", "npi": "1234567890"},
            "submission_date": datetime.datetime.utcnow().isoformat(),
            "submission_status": "accepted" if claim_rule["covered"] else "rejected",
            "tracking_id": "CH-" + str(uuid.uuid4())[:8]
        }

    return claim

def run_agent(db: Session, state: Dict[str, Any]) -> Dict[str, Any]:

    workflow_run_id = state.get("workflow_id", 0)

    clinical_note = """
    55-year-old male with chronic right knee pain for 3 years. 
    X-ray shows severe osteoarthritis. 
    Patient underwent right total knee replacement. 
    Discharge summary: stable, no complications.
    """

    procedure = "Knee Replacement"
    claim = generate_claim_submission(clinical_note, procedure)

    print("=== Mock Claim Submission ===")
    print(json.dumps(claim, indent=2))

    log_claim_submission(details=claim, workflow_run_id=workflow_run_id, db=db)
    log_workflow_run(state=state, db=db)

    # Save into workflow state
    state["claim_submission"] = claim
    return state
