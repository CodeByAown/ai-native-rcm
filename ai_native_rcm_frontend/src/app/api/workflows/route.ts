import { NextRequest, NextResponse } from 'next/server'
import { Workflow } from '@/types/workflows'

import { BACKEND_API_URL } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    // Fetch ALL workflows from backend (no sorting/filtering params)
    const response = await fetch(`${BACKEND_API_URL}/workflows`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`, // if needed
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with ${response.status}`)
    }
    
    const data = await response.json()

    console.log("Fetched workflows from backend:", data)
    
    // Get query parameters for frontend processing
    // const { searchParams } = new URL(request.url)
    // const sortBy = searchParams.get('sortBy') || 'dateCreated'
    // const sortDir = searchParams.get('sortDir') || 'desc'
    // const status = searchParams.get('status')
    
    let workflows: Workflow[] = data.workflows || data // Handle different response formats

    console.log("Initial workflows:", workflows)
    
    return NextResponse.json({
      workflows,
      total: workflows.length
    })
    
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows from backend' },
      { status: 500 }
    )
  }
}