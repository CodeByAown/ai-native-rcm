export interface PriorAuth {
    id: number
    patientId: string | null
    procedureCode: string
    authNumber: string
    status: string | null
    createdAt: string
    updatedAt: string
    workflowRunId: string
}

export type SortField = keyof PriorAuth
export type SortDirection = 'asc' | 'desc'