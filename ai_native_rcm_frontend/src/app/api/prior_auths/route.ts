import { NextRequest, NextResponse } from 'next/server'
import { PriorAuth } from '@/types/prior_auths'

import { BACKEND_API_URL } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    // Fetch ALL prior auths from backend
    const response = await fetch(`${BACKEND_API_URL}/prior_auths`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with ${response.status}`)
    }
    
    const data = await response.json()

    console.log("Fetched prior auths from backend:", data)
    
    let priorAuths: PriorAuth[] = data.priorAuths || data

    console.log("Initial prior auths:", priorAuths)
    
    return NextResponse.json({
      priorAuths,
      total: priorAuths.length
    })
    
  } catch (error) {
    console.error('Error fetching prior auths:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prior auths from backend' },
      { status: 500 }
    )
  }
}
