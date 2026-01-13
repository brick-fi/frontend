import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { AIInsights } from '@/types/metadata'

/**
 * API Route: Generate AI investment insights for properties using Claude
 * POST /api/ai/generate-insights
 */

interface PropertyInput {
  name: string
  location: string
  totalValue: number // in USD
  expectedMonthlyIncome: number // in USD
  description?: string
  amenities?: string[]
  tags?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const propertyData: PropertyInput = await request.json()

    if (!propertyData.name || !propertyData.location || !propertyData.totalValue) {
      return NextResponse.json(
        { error: 'Missing required property information' },
        { status: 400 }
      )
    }

    // Initialize Anthropic Claude
    const anthropic = new Anthropic({ apiKey: anthropicApiKey })

    // Calculate projected yield
    const annualIncome = propertyData.expectedMonthlyIncome * 12
    const projectedYield = ((annualIncome / propertyData.totalValue) * 100).toFixed(2)

    // Construct prompt
    const prompt = `You are a real estate investment analyst. Analyze this tokenized real estate property and generate investment insights.

IMPORTANT: Respond ONLY in English, regardless of the property location or language used in the input data.

Property Information:
- Name: ${propertyData.name}
- Location: ${propertyData.location}
- Total Value: $${propertyData.totalValue.toLocaleString()}
- Expected Monthly Income: $${propertyData.expectedMonthlyIncome.toLocaleString()}
- Projected Annual Yield: ${projectedYield}%
${propertyData.description ? `- Description: ${propertyData.description}` : ''}
${propertyData.amenities?.length ? `- Amenities: ${propertyData.amenities.join(', ')}` : ''}
${propertyData.tags?.length ? `- Tags: ${propertyData.tags.join(', ')}` : ''}

Generate a concise investment analysis with:

1. Key Advantages (3-4 points):
   - Focus on location benefits, yield potential, market demand
   - Include specific metrics when possible (e.g., "0.5% vacancy rate")
   - Highlight unique selling points
   - Keep each point to 1-2 sentences

2. Risk Factors (2-3 points):
   - Identify potential risks (regulatory, market, management)
   - Be realistic but not overly negative
   - Mention mitigation strategies if applicable
   - Keep each point to 1-2 sentences

Respond ONLY with a valid JSON object in this exact format:
{
  "keyAdvantages": ["advantage 1", "advantage 2", "advantage 3"],
  "riskFactors": ["risk 1", "risk 2"],
  "summary": "One sentence overall assessment",
  "yieldEstimate": "${projectedYield}%"
}

Be professional, data-driven, and concise. Focus on actionable insights for investors.`

    // Call Claude API (using Claude 4.5 Haiku - fastest, most cost-efficient)
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    if (!responseText) {
      throw new Error('No response from Claude')
    }

    // Extract JSON from response (Claude might wrap it in markdown)
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    // Parse AI response
    const insights: AIInsights = JSON.parse(jsonText)

    return NextResponse.json({
      success: true,
      insights,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    })

  } catch (error) {
    console.error('Error generating AI insights:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
