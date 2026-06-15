from concurrent.futures import thread
from pickle import TRUE
from sqlalchemy import Column, Integer, String
from database import Base

"""
Traditional RCM
=================

Eligibility → Prior-auth approval → Clinical documentation → 
Medical coding → Claims scrubbing → Claims submission → 
Remittance tracking → Denial management → Claims resubmission → Remittance tracking → Reconciliation.
"""

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    user_type = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String, index=True, nullable=False)
    thread_id = Column(String, index=True, nullable=False)
    patient_id = Column(String, index=True, nullable=True)
    workflow_type = Column(String, index=True, nullable=False)
    current_step = Column(String, nullable=True)
    status = Column(String, index=True, nullable=False)
    result = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

class EligibilityCheck(Base):
    __tablename__ = "eligibility_checks"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=True)
    insurance_id = Column(String, nullable=False)
    plan = Column(String, nullable=False)
    copay = Column(String, nullable=False)
    eligible = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class PriorAuth(Base):
    __tablename__ = "prior_auths"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=True)
    procedure_code = Column(String, nullable=False)
    auth_number = Column(String, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class ClinicalDocument(Base):
    __tablename__ = "clinical_documents"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=True)
    document_type = Column(String, nullable=False)
    content = Column(String, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class ClaimsScrubbing(Base):
    __tablename__ = "claims_scrubbing"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=True)
    procedure_code = Column(String, nullable=False)
    diagnosis_code = Column(String, nullable=False)
    operative_report = Column(String, nullable=False)
    pre_op_clearance = Column(String, nullable=False)
    physician_signature = Column(String, nullable=False)
    status = Column(String, index=True, nullable=True)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, index=True, nullable=False)
    patient_summary = Column(String, nullable=False)
    procedure_performed = Column(String, nullable=False)
    codes = Column(String, nullable=False)
    documentation = Column(String, nullable=False)
    payer = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    submission_date = Column(String, nullable=False)
    submission_status = Column(String, nullable=False)
    tracking_id = Column(String, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class Resubmission(Base):
    __tablename__ = "resubmissions"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class Denial(Base):
    __tablename__ = "denials"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, nullable=False)
    resubmission_id = Column(Integer, nullable=True)
    reason = Column(String, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, nullable=False)
    amount = Column(String, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)

class Reconciliation(Base):
    __tablename__ = "reconciliations"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, nullable=False)
    payment_id = Column(Integer, nullable=False)
    status = Column(String, index=True, nullable=False)
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
    workflow_run_id = Column(String, nullable=False)