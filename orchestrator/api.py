from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from pathlib import Path
from main import rcm_pipeline
from database import Base, engine, SessionLocal
from sqlalchemy.orm import Session
import models

# Create tables at startup
Base.metadata.create_all(bind=engine)

# initialize FastAPI app
app = FastAPI(title="RCM interface", version="1.0.0")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ensure upload directory exists
UPLOAD_DIR = Path("/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Define the API endpoints
@app.post("/run")
async def run(workflow_type: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Kick off a workflow run based on the specified type.

    The default is a full RCM workflow.

    Currently it is the only one that requires an upload.

    Args:
        workflow_type (str): Type of workflow to run
        file (UploadFile): Uploaded file to process
        
    Returns:
        JSONResponse: Result of the workflow execution
    """

    # Save uploaded file
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
        steps = [
            "eligibility",
            "prior_auth",
            "clinical_doc",
        ]
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
        raise HTTPException(
            status_code=400,
            detail=f"Invalid workflow type: {workflow_type}"
        )

    result = rcm_pipeline(db=db, steps=steps, workflow_type="full", file_path=str(file_path))

    try:
        return JSONResponse(
            status_code=200,
            content={
                "message": "Run successfully",
                "final_state": result
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )

@app.get("/workflows")
def get_workflows(db: Session = Depends(get_db)):
    """
    Retrieve all workflow runs from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of workflow runs.
    """
    workflows = db.query(models.WorkflowRun).all()
    return workflows

@app.get("/eligibility_checks")
def get_eligibility_checks(db: Session = Depends(get_db)):
    """
    Retrieve all eligibility checks from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of eligibility checks.
    """
    eligibility_checks = db.query(models.EligibilityCheck).all()
    return eligibility_checks

@app.get("/prior_auths")
def get_prior_auths(db: Session = Depends(get_db)):
    """
    Retrieve all prior authorizations from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of prior authorizations.
    """
    prior_auths = db.query(models.PriorAuth).all()
    return prior_auths

@app.get("/clinical_documents")
def get_clinical_documents(db: Session = Depends(get_db)):
    """
    Retrieve all clinical documents from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of clinical documents.
    """
    clinical_documents = db.query(models.ClinicalDocument).all()
    return clinical_documents

@app.get("/coded_encounters")
def get_coded_encounters(db: Session = Depends(get_db)):
    """
    Retrieve all coded encounters from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of coded encounters.
    """
    coded_encounters = db.query(models.ClinicalDocument).all()
    return coded_encounters


@app.get("/claims_scrubbing")
def get_claims_scrubbing(db: Session = Depends(get_db)):
    """
    Retrieve all claims scrubbing from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of claims scrubbing.
    """
    claims_scrubbing = db.query(models.ClaimsScrubbing).all()
    return claims_scrubbing

@app.get("/claims")
def get_claims(db: Session = Depends(get_db)):
    """
    Retrieve all claims from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of claims.
    """
    claims = db.query(models.Claim).all()
    return claims

@app.get("/denials")
def get_denials(db: Session = Depends(get_db)):
    """
    Retrieve all denials from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of denials.
    """
    denials = db.query(models.Denial).all()
    return denials

@app.get("/payments")
def get_payments(db: Session = Depends(get_db)):
    """
    Retrieve all payments from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of payments.
    """
    payments = db.query(models.Payment).all()
    return payments

@app.get("/reconciliations")
def get_reconciliations(db: Session = Depends(get_db)):
    """
    Retrieve all reconciliations from the database.
    Args:
        db (Session): Database session dependency.
    Returns:
        List of reconciliations.
    """
    reconciliations = db.query(models.Reconciliation).all()
    return reconciliations



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)