import os
import shutil
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import Base, engine, SessionLocal
from orchestrator import rcm_pipeline

# Create tables at startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RCM interface", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Upload directory is configurable so it works locally and on hosts with an
# ephemeral writable disk (e.g. Render writes under /tmp).
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/run")
async def run(workflow_type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Kick off a workflow run based on the specified type."""
    file_path = UPLOAD_DIR / file.filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    if workflow_type == "eligibility_only":
        steps = ["eligibility"]
    elif workflow_type == "clinical_doc_only":
        steps = ["clinical_doc"]
    elif workflow_type == "prior_auth_only":
        steps = ["prior_auth"]
    elif workflow_type == "pre_auth_clinical_doc":
        steps = ["eligibility", "prior_auth", "clinical_doc"]
    elif workflow_type == "full":
        steps = [
            "eligibility",
            "clinical_doc",
            "prior_auth",
            "medical_coding",
            "claim_scrubbing",
            "claim_submission",
        ]
    else:
        raise HTTPException(status_code=400, detail=f"Invalid workflow type: {workflow_type}")

    result = rcm_pipeline(db=db, steps=steps, workflow_type=workflow_type, file_path=str(file_path))

    return JSONResponse(
        status_code=200,
        content={"message": "Run successfully", "final_state": result},
    )


@app.get("/workflows")
def get_workflows(db: Session = Depends(get_db)):
    return db.query(models.WorkflowRun).all()


@app.get("/eligibility_checks")
def get_eligibility_checks(db: Session = Depends(get_db)):
    return db.query(models.EligibilityCheck).all()


@app.get("/prior_auths")
def get_prior_auths(db: Session = Depends(get_db)):
    return db.query(models.PriorAuth).all()


@app.get("/clinical_documents")
def get_clinical_documents(db: Session = Depends(get_db)):
    return db.query(models.ClinicalDocument).all()


@app.get("/coded_encounters")
def get_coded_encounters(db: Session = Depends(get_db)):
    return db.query(models.ClinicalDocument).all()


@app.get("/claims_scrubbing")
def get_claims_scrubbing(db: Session = Depends(get_db)):
    return db.query(models.ClaimsScrubbing).all()


@app.get("/claims")
def get_claims(db: Session = Depends(get_db)):
    return db.query(models.Claim).all()


@app.get("/denials")
def get_denials(db: Session = Depends(get_db)):
    return db.query(models.Denial).all()


@app.get("/payments")
def get_payments(db: Session = Depends(get_db)):
    return db.query(models.Payment).all()


@app.get("/reconciliations")
def get_reconciliations(db: Session = Depends(get_db)):
    return db.query(models.Reconciliation).all()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "9000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
