from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import shutil
from pathlib import Path
from main import run_agent
from database import Base, engine, SessionLocal
from sqlalchemy.orm import Session

app = FastAPI(title="Eligibility Agent", version="1.0.0")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RunRequest(BaseModel):
    workflow_type: str
    file_path: str
    workflow_id: str
    thread_id: str

@app.post("/run")
async def run(request: RunRequest, db: Session = Depends(get_db)):
    """
    Upload a file to the server
    
    Args:
        file: The file to upload
        
    Returns:
        JSON response with upload status and file info
    """

    try:
        initial_state = {
            "workflow_type": request.workflow_type, 
            "file_path": request.file_path,
            "workflow_id": request.workflow_id,
            "thread_id": request.thread_id
        }
        final_state = run_agent(db=db, state=initial_state)

        return JSONResponse(
            status_code=200,
            content={
                "message": "Run successfully",
                "final_state": final_state
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)