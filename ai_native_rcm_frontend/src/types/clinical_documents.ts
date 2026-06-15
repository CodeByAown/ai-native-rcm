// class ClinicalDocument(Base):
//     __tablename__ = "clinical_documents"
//     id = Column(Integer, primary_key=True, index=True)
//     patient_id = Column(String, index=True, nullable=True)
//     document_type = Column(String, nullable=False)
//     content = Column(String, nullable=False)
//     status = Column(String, index=True, nullable=False)
//     created_at = Column(String, nullable=False)
//     updated_at = Column(String, nullable=False)
//     workflow_run_id = Column(String, nullable=False)

export interface ClinicalDocument {
  id: number
  patientId: string | null
  documentType: string
  content: string
  status: string | null
  createdAt: string
  updatedAt: string
  workflowRunId: string
}

export type SortField = keyof ClinicalDocument
export type SortDirection = 'asc' | 'desc'