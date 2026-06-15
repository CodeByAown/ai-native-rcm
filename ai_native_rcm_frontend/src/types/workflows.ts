export interface Workflow {
    id: number
    workflow_id: string
    workflow_type: 'full' | 'clinical_doc_only' | 'prior_auth_only' | null
    patient_id: string | null
    current_step: string
    status: 'started' | 'in_progress' | 'completed' | 'failed'
    result: string | null
    error_message: string | null
    thread_id: string
    created_at: string
    updated_at: string
}

export type SortField = keyof Workflow
export type SortDirection = 'asc' | 'desc'