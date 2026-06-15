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

// Types for clinical documents
type DocumentStatus = 'draft' | 'final' | 'amended' | 'entered-in-error'
type SortField = 'documentId' | 'type' | 'author' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

interface ClinicalDocument {
  id: string
  documentId: string
  type: string
  author: string
  createdAt: string
  status: DocumentStatus
  updatedAt: string
}

const statusColors: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  final: 'bg-green-100 text-green-800',
  amended: 'bg-yellow-100 text-yellow-800',
  'entered-in-error': 'bg-red-100 text-red-800',
}

const statusLabels: Record<DocumentStatus, string> = {
  draft: 'Draft',
  final: 'Final',
  amended: 'Amended',
  'entered-in-error': 'Entered in Error',
}

export function ClinicalDocumentsTable() {
  const [documents, setDocuments] = useState<ClinicalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sortBy: sortField,
        sortDir: sortDirection,
        status: statusFilter,
      })

      const response = await fetch(`/api/clinical_documents?${params}`)
      const responseData = await response.json()

      console.log('Fetched clinical documents:', responseData)

      if (response.ok) {
        setDocuments(responseData.clinicalDocuments)
      } else {
        console.error('Failed to fetch clinical documents:')
      }
    } catch (error) {
      console.error('Error fetching clinical documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
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
        <span className="ml-2">Loading clinical documents...</span>
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
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="amended">Amended</SelectItem>
              <SelectItem value="entered-in-error">Entered in Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {documents.length} documents found
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
                  onClick={() => handleSort('documentId')}
                >
                  Document ID
                  {getSortIcon('documentId')}
                </Button>
              </TableHead>
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
                  onClick={() => handleSort('documenttype')}
                >
                  Document Type
                  {getSortIcon('documenttype')}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold"
                  onClick={() => handleSort('documentcontent')}
                >
                  Document Content
                  {getSortIcon('documentcontent')}
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
                  onClick={() => handleSort('updatedAt')}
                >
                  Last Updated
                  {getSortIcon('updatedAt')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No clinical documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {doc.id}
                  </TableCell>
                   <TableCell className="font-medium">
                    {doc.workflow_run_id}
                  </TableCell>
                  <TableCell>{doc.document_type}</TableCell>
                  <TableCell> 
                    {doc.content && doc.content.slice(0, 12) + '...'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[doc.status]}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>{formatDate(doc.updated_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
