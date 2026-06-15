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

// Types for eligibility checks
type EligibilityStatus = 'pending' | 'passed' | 'failed' | 'skipped'
type SortField = 'checkId' | 'checkType' | 'status' | 'createdAt' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

interface EligibilityCheck {
  id: string
  check_id: string
  check_type: string
  status: EligibilityStatus
  created_at: string
  updated_at: string
  details: string
}

const statusColors: Record<EligibilityStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<EligibilityStatus, string> = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  skipped: 'Skipped',
}

export function EligibilityChecksTable() {
  const [checks, setChecks] = useState<EligibilityCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchChecks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy: sortField,
        sortDir: sortDirection,
        status: statusFilter,
      })

      const response = await fetch(`/api/eligibility_checks?${params}`)
      const responseData = await response.json()

      console.log('Fetched eligibility checks:', responseData)

      if (response.ok) {
        setChecks(responseData.eligibilityChecks)
      } else {
        console.error('Failed to fetch eligibility checks:')
      }
    } catch (error) {
      console.error('Error fetching eligibility checks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChecks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <span className="ml-2">Loading eligibility checks...</span>
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
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {checks.length} eligibility checks found
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
                  onClick={() => handleSort('workflowId')}
                >
                  Workflow ID
                  {getSortIcon('workflowId')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('insuranceId')}
                >
                  Insurance ID
                  {getSortIcon('insuranceId')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('plan')}
                >
                  Plan
                  {getSortIcon('plan')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('copay')}
                >
                  Copay
                  {getSortIcon('copay')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('eligible')}
                >
                  Eligible?
                  {getSortIcon('eligible')}
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
                  onClick={() => handleSort('updatedAt')}
                >
                  Last Updated
                  {getSortIcon('updatedAt')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No eligibility checks found.
                </TableCell>
              </TableRow>
            ) : (
              checks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell className="font-medium">
                    {check.workflow_run_id}
                  </TableCell>
                  <TableCell>{check.insurance_id}</TableCell>
                  <TableCell>{check.plan}</TableCell>
                  <TableCell>
                    {typeof check.copay === 'string' && check.copay.length > 12
                      ? check.copay.slice(0, 12) + '...'
                      : check.copay}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[check.status]}>
                      {check.eligible ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(check.created_at)}</TableCell>
                  <TableCell>{formatDate(check.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
