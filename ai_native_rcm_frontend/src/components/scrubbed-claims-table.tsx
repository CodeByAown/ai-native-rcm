'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { Claim, SortField, SortDirection } from '@/types/claims'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  under_review: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
}

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  under_review: 'Under Review',
  processing: 'Processing',
}

export function ScrubbedClaimsTable() {
  const [scrubbed_claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('dateSubmitted')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy: sortField,
        sortDir: sortDirection,
        status: statusFilter,
      })
      
      const response = await fetch(`/api/scrubbed_claims?${params}`)
      const data = await response.json()

      console.log('Fetched scrubbed_claims:', data)
      
      if (response.ok) {
        setClaims(data.scrubbedClaims)
      } else {
        console.error('Failed to fetch claims:', data.error)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [sortField, sortDirection, statusFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading claims...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Status:
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {scrubbed_claims.length} claims found
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('scrubbingId')}
                >
                  Scrubbing ID
                  {getSortIcon('scrubbingId')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('workflowID')}
                >
                  Workflow run ID
                  {getSortIcon('workflowID')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('diagnosisCode')}
                >
                  Diagnosis Code
                  {getSortIcon('diagnosisCode')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('procedureCode')}
                >
                 Procedure Code
                  {getSortIcon('procedureCode')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('procedureCode')}
                >
                 Pre-Op Clearance
                  {getSortIcon('procedureCode')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('operativeReport')}
                >
                 Operative Report
                  {getSortIcon('operativeReport')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('physician')}
                >
                 Physician
                  {getSortIcon('physician')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('status')}
                >
                 Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('createdAt')}
                >
                  Created At
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('lastUpdate')}
                >
                  Last Update
                  {getSortIcon('lastUpdate')}
                </Button>
              </TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {scrubbed_claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No claims found.
                </TableCell>
              </TableRow>
            ) : (
              scrubbed_claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    {claim.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {claim.workflow_run_id}
                  </TableCell>
                  <TableCell>{claim.diagnosis_code}</TableCell>
                  <TableCell>{claim.procedure_code}</TableCell>
                  <TableCell>{claim.pre_op_clearance}</TableCell>
                  <TableCell>{claim.operative_report}</TableCell>
                  <TableCell>{claim.physician_signature}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[claim.status]}>
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(claim.created_at)}</TableCell>
                  <TableCell>{formatDate(claim.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}