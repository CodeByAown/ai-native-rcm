"""
02-clinical-documentation.py: Generate clinical documentation from provider-patient transcript.
pip install openai
"""
import cohere
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import models
from typing import Dict, Any


def log_workflow_run(state: Dict[str, Any], db: Session):
    try:
        workflow_id = state.get("workflow_id", 0)
        run = (
            db.query(models.WorkflowRun)
            .filter(models.WorkflowRun.workflow_id == workflow_id)
            .first()
        )
        if run:
            run.current_step = "clinical_doc"
            run.updated_at = text("CURRENT_TIMESTAMP")
            db.commit()
        print("Logged workflow run to database for workflow_id:", workflow_id)
    except Exception as e:
        print("Error logging workflow run:", str(e))

def log_clinical_doc(details: Dict[str, Any], workflow_run_id: str, db: Session):
    try:
        new_doc = models.ClinicalDocument(
            patient_id=details.get("patient_id"),
            document_type="SOAP Note",
            content=json.dumps(details),
            status="Completed",
            created_at=text("CURRENT_TIMESTAMP"),
            updated_at=text("CURRENT_TIMESTAMP"),
            workflow_run_id=workflow_run_id
        )
        db.add(new_doc)
        db.commit()
        print("Logged clinical document to database for patient_id:", details.get("patient_id"))
    except Exception as e:
        print("Error logging clinical document:", str(e))

def generate_clinical_doc(transcript: str):
    """
    Use LLM to generate SOAP note + coding suggestions
    
    OpenAI GPT-4 Example Prompt:
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # lightweight LLM good for prototyping
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return response.choices[0].message.content
    """
    
    prompt = f"""
    You are a clinical documentation assistant.
    Convert the following provider-patient transcript into a structured SOAP note
    and suggest possible ICD-10 and CPT codes.

    Transcript:
    {transcript}

    Output format:
    - Subjective:
    - Objective:
    - Assessment:
    - Plan:
    - Suggested ICD-10 Codes:
    - Suggested CPT Codes:

    Required JSON fields:
    {{
        "subjective": string,
        "objective": string,
        "assessment": string,
        "plan": string,
        "icd10_codes": list of strings,
        "cpt_codes": list of strings
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

    sample_transcript = """
    Patient reports chest tightness and shortness of breath for the past 2 days.
    Denies fever or cough. 
    On exam: BP 140/90, HR 96, O2 Sat 94% on room air, mild wheezing on auscultation.
    Provider suspects asthma exacerbation, will start inhaled corticosteroids,
    order chest X-ray, and follow up in 1 week.
    """

    clinical_doc = generate_clinical_doc(sample_transcript)
    print("=== AI-Generated Clinical Documentation ===")
    print(clinical_doc)

    log_clinical_doc(details=clinical_doc, workflow_run_id=workflow_run_id, db=db)
    log_workflow_run(state=state, db=db)

    state["clinical_doc"] = clinical_doc
    return state