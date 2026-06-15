import { NextRequest, NextResponse } from 'next/server'
import { ClinicalDocument } from '@/types/clinical_documents'

import { BACKEND_API_URL } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    // Fetch ALL clinical documents from backend
    const response = await fetch(`${BACKEND_API_URL}/clinical_documents`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with ${response.status}`)
    }
    
    const data = await response.json()

    console.log("Fetched clinical documents from backend:", data)
    
    let clinicalDocuments: ClinicalDocument[] = data.clinicalDocuments || data

    console.log("Initial clinical documents:", clinicalDocuments)
    
    return NextResponse.json({
      clinicalDocuments,
      total: clinicalDocuments.length
    })
    
  } catch (error) {
    console.error('Error fetching clinical documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinical documents from backend' },
      { status: 500 }
    )
  }
}
