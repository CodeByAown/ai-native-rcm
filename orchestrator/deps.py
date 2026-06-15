from concurrent.futures import thread
from typing import Dict, Any

class RCMState(Dict[str, Any]):
    workflow_type: str
    file_path: str

    workflow_id: str
    thread_id: str

    eligibility: Any
    prior_auth: Any
    clinical_doc: Any
    medical_coding: Any
    claim_scrubbing: Any
    claim_submission: Any

    success: bool
    error_message: str
    
    retry_count: int
    source: str