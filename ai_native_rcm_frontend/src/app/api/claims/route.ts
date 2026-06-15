import { NextRequest, NextResponse } from 'next/server'
import { Claim } from '@/types/claims'

import { BACKEND_API_URL } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    // Fetch ALL claims from backend (no sorting/filtering params)
    const response = await fetch(`${BACKEND_API_URL}/claims`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`, // if needed
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with ${response.status}`)
    }
    
    const data = await response.json()

    console.log("Fetched claims from backend:")
    
    // Get query parameters for frontend processing
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'dateSubmitted'
    const sortDir = searchParams.get('sortDir') || 'desc'
    const status = searchParams.get('status')
    
    let claims: Claim[] = data.claims || data // Handle different response formats
    
    // Frontend filtering
    if (status && status !== 'all') {
      claims = claims.filter(claim => claim.status === status)
    }
    
    // Frontend sorting
    claims.sort((a, b) => {
      const aValue = a[sortBy as keyof Claim]
      const bValue = b[sortBy as keyof Claim]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDir === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDir === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      // Handle dates
      if (sortBy === 'dateSubmitted') {
        const dateA = new Date(aValue as string).getTime()
        const dateB = new Date(bValue as string).getTime()
        return sortDir === 'asc' ? dateA - dateB : dateB - dateA
      }
      
      return 0
    })
    
    return NextResponse.json({
      claims,
      total: claims.length
    })
    
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claims from backend' },
      { status: 500 }
    )
  }
}