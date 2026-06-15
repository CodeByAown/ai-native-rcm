import { NextRequest, NextResponse } from 'next/server'
import { CodedEncounter } from '@/types/coded_encounters'

import { BACKEND_API_URL } from '@/lib/backend'

export async function GET(request: NextRequest) {
  try {
    // Fetch ALL coded encounters from backend
    const response = await fetch(`${BACKEND_API_URL}/coded_encounters`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API responded with ${response.status}`)
    }
    
    const data = await response.json()

    console.log("Fetched coded encounters from backend:", data)
    
    let codedEncounters: CodedEncounter[] = data.codedEncounters || data

    console.log("Initial coded encounters:", codedEncounters)
    
    return NextResponse.json({
      codedEncounters,
      total: codedEncounters.length
    })
    
  } catch (error) {
    console.error('Error fetching coded encounters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coded encounters from backend' },
      { status: 500 }
    )
  }
}
