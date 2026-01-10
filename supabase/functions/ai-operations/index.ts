import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import OpenAI from 'https://esm.sh/openai@4.73.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  action: 'generate_content' | 'chat'
  payload: GenerateContentPayload | ChatPayload
}

interface GenerateContentPayload {
  documentType: string
  requirements: string
  context?: Record<string, unknown>
}

interface ChatPayload {
  messages: Array<{ role: string; content: string }>
  context?: Record<string, unknown>
}

// Input validation constants
const MAX_DOCUMENT_TYPE_LENGTH = 100
const MAX_REQUIREMENTS_LENGTH = 5000
const MAX_CONTEXT_SIZE = 50000 // ~50KB
const MAX_CHAT_MESSAGES = 50
const MAX_MESSAGE_LENGTH = 10000
const VALID_DOCUMENT_TYPES = [
  'local_file',
  'master_file',
  'country_by_country',
  'benchmarking_study',
  'intercompany_agreement',
  'functional_analysis',
  'economic_analysis',
  'policy_document',
  'other'
]

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_REQUESTS = 20
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  
  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return false
  }
  
  userLimit.count++
  return true
}

function validateString(value: unknown, maxLength: number, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`)
  }
  if (value.length === 0) {
    throw new Error(`${fieldName} cannot be empty`)
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`)
  }
  return value
}

function sanitizeForPrompt(input: string): string {
  // Remove potential prompt injection patterns
  return input
    .replace(/```/g, '\'\'\'')
    .replace(/\$\{/g, '\\${')
    .trim()
}

function validateGenerateContentPayload(payload: unknown): GenerateContentPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload')
  }
  
  const p = payload as Record<string, unknown>
  
  const documentType = validateString(p.documentType, MAX_DOCUMENT_TYPE_LENGTH, 'documentType')
  
  // Validate document type against allowed list
  if (!VALID_DOCUMENT_TYPES.includes(documentType.toLowerCase())) {
    throw new Error(`Invalid documentType. Must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`)
  }
  
  const requirements = validateString(p.requirements, MAX_REQUIREMENTS_LENGTH, 'requirements')
  
  let context: Record<string, unknown> | undefined
  if (p.context !== undefined) {
    if (typeof p.context !== 'object' || p.context === null) {
      throw new Error('context must be an object')
    }
    const contextStr = JSON.stringify(p.context)
    if (contextStr.length > MAX_CONTEXT_SIZE) {
      throw new Error(`context exceeds maximum size of ${MAX_CONTEXT_SIZE} bytes`)
    }
    context = p.context as Record<string, unknown>
  }
  
  return {
    documentType: sanitizeForPrompt(documentType),
    requirements: sanitizeForPrompt(requirements),
    context
  }
}

function validateChatPayload(payload: unknown): ChatPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload')
  }
  
  const p = payload as Record<string, unknown>
  
  if (!Array.isArray(p.messages)) {
    throw new Error('messages must be an array')
  }
  
  if (p.messages.length === 0) {
    throw new Error('messages cannot be empty')
  }
  
  if (p.messages.length > MAX_CHAT_MESSAGES) {
    throw new Error(`messages exceeds maximum of ${MAX_CHAT_MESSAGES} messages`)
  }
  
  const validRoles = ['user', 'assistant', 'system']
  const validatedMessages = p.messages.map((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      throw new Error(`messages[${index}] must be an object`)
    }
    const m = msg as Record<string, unknown>
    
    if (typeof m.role !== 'string' || !validRoles.includes(m.role)) {
      throw new Error(`messages[${index}].role must be one of: ${validRoles.join(', ')}`)
    }
    
    const content = validateString(m.content, MAX_MESSAGE_LENGTH, `messages[${index}].content`)
    
    return {
      role: m.role,
      content: sanitizeForPrompt(content)
    }
  })
  
  let context: Record<string, unknown> | undefined
  if (p.context !== undefined) {
    if (typeof p.context !== 'object' || p.context === null) {
      throw new Error('context must be an object')
    }
    const contextStr = JSON.stringify(p.context)
    if (contextStr.length > MAX_CONTEXT_SIZE) {
      throw new Error(`context exceeds maximum size of ${MAX_CONTEXT_SIZE} bytes`)
    }
    context = p.context as Record<string, unknown>
  }
  
  return {
    messages: validatedMessages,
    context
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id}`)
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize OpenAI with secret key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Parse and validate request body
    let requestBody: AIRequest
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action, payload } = requestBody

    // Validate action
    if (!action || !['generate_content', 'chat'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "generate_content" or "chat"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`AI operation requested: ${action} by user ${user.id}`)

    switch (action) {
      case 'generate_content': {
        // Validate payload
        let validatedPayload: GenerateContentPayload
        try {
          validatedPayload = validateGenerateContentPayload(payload)
        } catch (validationError) {
          return new Response(
            JSON.stringify({ error: validationError instanceof Error ? validationError.message : 'Invalid payload' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { documentType, requirements, context } = validatedPayload

        const systemPrompt = `You are an expert transfer pricing consultant. Generate professional, OECD-compliant transfer pricing documentation content.

Document Type: ${documentType}
Requirements: ${requirements}
Context: ${context ? JSON.stringify(context, null, 2) : 'None provided'}

Please provide structured, professional content that meets international transfer pricing standards.`

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate ${documentType} content with the following requirements: ${requirements}` }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        })

        const generatedContent = completion.choices[0]?.message?.content || ''

        // Log the generation for audit purposes
        await supabase.from('tp_audit_log').insert({
          user_id: user.id,
          action: 'AI_CONTENT_GENERATION',
          resource_type: 'document_content',
          metadata: {
            document_type: documentType,
            content_length: generatedContent.length,
            model_used: 'gpt-4'
          }
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            content: generatedContent,
            metadata: {
              model: 'gpt-4',
              content_length: generatedContent.length
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'chat': {
        // Validate payload
        let validatedPayload: ChatPayload
        try {
          validatedPayload = validateChatPayload(payload)
        } catch (validationError) {
          return new Response(
            JSON.stringify({ error: validationError instanceof Error ? validationError.message : 'Invalid payload' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { messages, context } = validatedPayload

        const systemMessage = {
          role: 'system' as const,
          content: `You are TaxStreamline AI, an expert tax and transfer pricing assistant. You help users with:
- Transfer pricing documentation and compliance
- Tax calculations and planning
- OECD guidelines and international tax matters
- Nigerian tax regulations (FIRS compliance)
- Document generation and review

Current context: ${context ? JSON.stringify(context, null, 2) : 'None provided'}

Provide accurate, professional guidance while being helpful and conversational.`
        }

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [systemMessage, ...messages],
          max_tokens: 1500,
          temperature: 0.7,
        })

        const assistantResponse = completion.choices[0]?.message?.content || ''

        // Log the chat interaction
        await supabase.from('tp_audit_log').insert({
          user_id: user.id,
          action: 'AI_CHAT_INTERACTION',
          resource_type: 'chat_session',
          metadata: {
            message_count: messages.length,
            response_length: assistantResponse.length,
            model_used: 'gpt-4'
          }
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            response: assistantResponse,
            metadata: {
              model: 'gpt-4',
              response_length: assistantResponse.length
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error: unknown) {
    // Log detailed error server-side only
    console.error('AI operations error:', error)
    
    // Return generic error to client - never expose internal details
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred processing your request. Please try again.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
