export interface Claim {
  id: string
  claimNumber: string
  customerName: string
  dateSubmitted: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'processing'
  description: string
  assignedTo?: string
}

export type SortField = keyof Claim
export type SortDirection = 'asc' | 'desc'