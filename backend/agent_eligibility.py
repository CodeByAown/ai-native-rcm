"""
Eligibility agent: extract insurance ID from card image and check eligibility.
"""
from typing import Dict, Any
import json

import pytesseract
from PIL import Image
from sqlalchemy import text
from sqlalchemy.orm import Session

import models
from cohere_client import get_cohere

# Mock eligibility database
mock_db = {
    "ABC123456": {"status": "Eligible", "plan": "Gold PPO", "copay": "$25"},
    "XYZ987654": {"status": "Inactive", "plan": "Silver HMO", "copay": "N/A"},
    "5678 1234-A": {"status": "Eligible", "plan": "Gold PPO", "copay": "$25"},
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
            run.current_step = "eligibility"
            run.updated_at = text("CURRENT_TIMESTAMP")
            db.commit()
        print("Logged workflow run to database for workflow_id:", workflow_id)
    except Exception as e:
        print("Error logging workflow run:", str(e))


def log_eligibility_check(details: Dict[str, Any], workflow_run_id: str, db: Session):
    try:
        new_check = models.EligibilityCheck(
            insurance_id=details.get("insurance_id"),
            plan=details.get("plan"),
            copay=details.get("copay"),
            eligible=details.get("eligible"),
            created_at=text("CURRENT_TIMESTAMP"),
            updated_at=text("CURRENT_TIMESTAMP"),
            workflow_run_id=workflow_run_id,
        )
        db.add(new_check)
        db.commit()
        print("Logged eligibility check for insurance_id:", details.get("insurance_id"))
    except Exception as e:
        print("Error logging eligibility check:", str(e))


def extract_insurance_details_ocr(image_path) -> str:
    """Extract raw text from an insurance card image using OCR."""
    img = Image.open(image_path)
    return pytesseract.image_to_string(img).strip()


def extract_with_llm(text_blob: str) -> dict:
    """Use an LLM to extract insurance details as JSON."""
    prompt = f"""
    You are a medical insurance card parser.
    Extract key fields from this OCR text and return as valid JSON:

    OCR Text:
    {text_blob}

    Required JSON fields:
    {{
      "insurance_id": string,
      "plan": string,
      "copay": string
    }}
    """
    try:
        co = get_cohere()
        response = co.chat(
            model="command-r-plus-08-2024",
            messages=[{"role": "user", "content": prompt}],
        )
        res = response.message.content[0].text.strip()
        return json.loads(res)
    except json.JSONDecodeError:
        return {"insurance_id": None, "plan": None, "copay": None}
    except Exception as e:
        print("[LLM] Error:", e)
        return {"insurance_id": None, "plan": None, "copay": None}


def check_eligibility(insurance_id):
    """Mock eligibility check against the database."""
    return bool(mock_db.get(insurance_id))


def run_agent(db: Session, state: Dict[str, Any]) -> Dict[str, Any]:
    workflow_run_id = state.get("workflow_id", 0)

    if "file_path" in state:
        text_blob = extract_insurance_details_ocr(state["file_path"])
        details = extract_with_llm(text_blob)
        state["eligibility"] = details

        if details.get("insurance_id"):
            eligibility_result = check_eligibility(details["insurance_id"])
            state["eligibility"]["eligible"] = eligibility_result
            state["success"] = True
    else:
        state["success"] = False
        state["error_message"] = "file_path not provided"

    log_workflow_run(state=state, db=db)
    log_eligibility_check(details=state.get("eligibility", {}), workflow_run_id=workflow_run_id, db=db)

    return state
