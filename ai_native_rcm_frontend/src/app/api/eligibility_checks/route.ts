import { NextRequest, NextResponse } from 'next/server'
import { EligibilityCheck } from '@/types/eligibility_checks'

import { BACKEND_API_URL } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    // Fetch ALL eligibility checks from backend
    const response = await fetch(`${BACKEND_API_URL}/eligibility_checks`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with ${response.status}`)
    }
    
    const data = await response.json()

    console.log("Fetched eligibility checks from backend:", data)
    
    let eligibilityChecks: EligibilityCheck[] = data.eligibilityChecks || data

    console.log("Initial eligibility checks:", eligibilityChecks)
    
    return NextResponse.json({
      eligibilityChecks,
      total: eligibilityChecks.length
    })
    
  } catch (error) {
    console.error('Error fetching eligibility checks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch eligibility checks from backend' },
      { status: 500 }
    )
  }
}
