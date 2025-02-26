import { SearchResults } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 60

// Retrieve schema for validation
const retrieveRequestSchema = z.object({
  url: z.string().url()
})

const CONTENT_CHARACTER_LIMIT = 10000

async function fetchJinaReaderData(url: string): Promise<SearchResults | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-With-Generated-Alt': 'true'
      }
    })
    const json = await response.json()
    if (!json.data || json.data.length === 0) {
      return null
    }

    const content = json.data.content.slice(0, CONTENT_CHARACTER_LIMIT)

    return {
      results: [
        {
          title: json.data.title,
          content,
          url: json.data.url
        }
      ],
      query: '',
      images: []
    }
  } catch (error) {
    console.error('Jina Reader API error:', error)
    return null
  }
}

async function fetchTavilyExtractData(
  url: string
): Promise<SearchResults | null> {
  try {
    const apiKey = process.env.TAVILY_API_KEY
    const response = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ api_key: apiKey, urls: [url] })
    })
    const json = await response.json()
    if (!json.results || json.results.length === 0) {
      return null
    }

    const result = json.results[0]
    const content = result.raw_content.slice(0, CONTENT_CHARACTER_LIMIT)

    return {
      results: [
        {
          title: content.slice(0, 100),
          content,
          url: result.url
        }
      ],
      query: '',
      images: []
    }
  } catch (error) {
    console.error('Tavily Extract API error:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate retrieve request
    const validationResult = retrieveRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid retrieve request',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const { url } = validationResult.data

    let results: SearchResults | null

    // Use Jina if the API key is set, otherwise use Tavily
    const useJina = process.env.JINA_API_KEY
    if (useJina) {
      results = await fetchJinaReaderData(url)
    } else {
      results = await fetchTavilyExtractData(url)
    }

    if (!results) {
      return NextResponse.json(
        { error: 'Failed to retrieve content from URL' },
        { status: 404 }
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error retrieving content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
