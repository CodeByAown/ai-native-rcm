// class EligibilityCheck(Base):
//     __tablename__ = "eligibility_checks"
//     id = Column(Integer, primary_key=True, index=True)
//     patient_id = Column(String, index=True, nullable=True)
//     insurance_id = Column(String, nullable=False)
//     plan = Column(String, nullable=False)
//     copay = Column(String, nullable=False)
//     eligible = Column(String, index=True, nullable=False)
//     created_at = Column(String, nullable=False)
//     updated_at = Column(String, nullable=False)
//     workflow_run_id = Column(String, nullable=False)

export interface EligibilityCheck {
  id: number
  patientId: string | null
  insuranceId: string
  plan: string
  copay: string
  eligible: string | null
  createdAt: string
  updatedAt: string
  workflowRunId: string
}

export type SortField = keyof EligibilityCheck
export type SortDirection = 'asc' | 'desc'