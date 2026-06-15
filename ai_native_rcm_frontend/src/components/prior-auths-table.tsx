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

// Types for prior auths
type PriorAuthStatus = 'pending' | 'approved' | 'denied' | 'expired'
type SortField = 'authId' | 'patientName' | 'provider' | 'createdAt' | 'status' | 'service'
type SortDirection = 'asc' | 'desc'

interface PriorAuth {
  id: string
  auth_id: string
  patient_name: string
  provider: string
  service: string
  status: PriorAuthStatus
  created_at: string
  updated_at: string
}

const statusColors: Record<PriorAuthStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  denied: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
}

const statusLabels: Record<PriorAuthStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  expired: 'Expired',
}

export function PriorAuthsTable() {
  const [priorAuths, setPriorAuths] = useState<PriorAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchPriorAuths = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy: sortField,
        sortDir: sortDirection,
        status: statusFilter,
      })

      const response = await fetch(`/api/prior_auths?${params}`)
      const responseData = await response.json()

      console.log('Fetched prior auths:', responseData)

      if (response.ok) {
        setPriorAuths(responseData.priorAuths)
      } else {
        console.error('Failed to fetch prior auths:')
      }
    } catch (error) {
      console.error('Error fetching prior auths:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPriorAuths()
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
        <span className="ml-2">Loading prior auths...</span>
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
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {priorAuths.length} prior auths found
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
                  {getSortIcon('worklow_id')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('Pprocedure_code')}
                >
                  Procedure Code
                  {getSortIcon('procedure_code')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('auth_number')}
                >
                  Auth Number
                  {getSortIcon('auth_number')}
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
                  onClick={() => handleSort('updated_at')}
                >
                  Last Updated
                  {getSortIcon('updated_at')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priorAuths.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No prior auths found.
                </TableCell>
              </TableRow>
            ) : (
              priorAuths.map((auth) => (
                <TableRow key={auth.id}>
                  <TableCell className="font-medium">
                    {auth.workflow_run_id}
                  </TableCell>
                  <TableCell>{auth.procedure_code}</TableCell>
                  <TableCell>{auth.auth_number}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[auth.status]}>
                      {auth.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(auth.created_at)}</TableCell>
                  <TableCell>{formatDate(auth.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
