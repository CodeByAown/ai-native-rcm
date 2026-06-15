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

// Types for workflows
type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived'
type SortField = 'workflowName' | 'owner' | 'createdAt' | 'status' | 'steps'
type SortDirection = 'asc' | 'desc'

interface Workflow {
  id: string
  workflowName: string
  owner: string
  createdAt: string
  status: WorkflowStatus
  steps: number
  description: string
}

const statusColors: Record<WorkflowStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-800',
}

const statusLabels: Record<WorkflowStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
}

export function WorkflowsTable() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy: sortField,
        sortDir: sortDirection,
        status: statusFilter,
      })

      const response = await fetch(`/api/workflows?${params}`)
      const responseData = await response.json()

      if (response.ok) {
        setWorkflows(responseData.workflows)
      } else {
        console.error('Failed to fetch workflows:')
      }
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
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
        <span className="ml-2">Loading workflows...</span>
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {workflows.length} workflows found
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
                  onClick={() => handleSort('workflowID')}
                >
                  Workflow ID
                  {getSortIcon('workflowID')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('workflowType')}
                >
                  Workflow Type
                  {getSortIcon('workflowType')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('current_step')}
                >
                  Current Step
                  {getSortIcon('current_step')}
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
                  onClick={() => handleSort('LastUpdated')}
                >
                  Last Updated
                  {getSortIcon('LastUpdated')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No workflows found.
                </TableCell>
              </TableRow>
            ) : (
              workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">
                    {workflow.workflow_id}
                  </TableCell>
                  <TableCell>{workflow.workflow_type}</TableCell>
                  <TableCell>{workflow.current_step}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[workflow.status]}>
                      {workflow.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(workflow.created_at)}</TableCell>
                  <TableCell>{formatDate(workflow.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
