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
  tools?: Array<{ type: string; function: { name: string; description: string; parameters: Record<string, unknown> } }>
}

// Input validation constants
const MAX_DOCUMENT_TYPE_LENGTH = 100
const MAX_REQUIREMENTS_LENGTH = 5000
const MAX_CONTEXT_SIZE = 50000
const MAX_CHAT_MESSAGES = 50
const MAX_MESSAGE_LENGTH = 10000
const VALID_DOCUMENT_TYPES = [
  'local_file', 'master_file', 'country_by_country', 'benchmarking_study',
  'intercompany_agreement', 'functional_analysis', 'economic_analysis',
  'policy_document', 'other'
]

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_REQUESTS = 20
const RATE_LIMIT_WINDOW_MS = 60000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (userLimit.count >= RATE_LIMIT_REQUESTS) return false
  userLimit.count++
  return true
}

function validateString(value: unknown, maxLength: number, fieldName: string): string {
  if (typeof value !== 'string') throw new Error(`${fieldName} must be a string`)
  if (value.length === 0) throw new Error(`${fieldName} cannot be empty`)
  if (value.length > maxLength) throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`)
  return value
}

function sanitizeForPrompt(input: string): string {
  return input.replace(/```/g, '\'\'\'').replace(/\$\{/g, '\\${').trim()
}

function validateGenerateContentPayload(payload: unknown): GenerateContentPayload {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload')
  const p = payload as Record<string, unknown>
  const documentType = validateString(p.documentType, MAX_DOCUMENT_TYPE_LENGTH, 'documentType')
  if (!VALID_DOCUMENT_TYPES.includes(documentType.toLowerCase())) {
    throw new Error(`Invalid documentType. Must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`)
  }
  const requirements = validateString(p.requirements, MAX_REQUIREMENTS_LENGTH, 'requirements')
  let context: Record<string, unknown> | undefined
  if (p.context !== undefined) {
    if (typeof p.context !== 'object' || p.context === null) throw new Error('context must be an object')
    if (JSON.stringify(p.context).length > MAX_CONTEXT_SIZE) throw new Error(`context exceeds maximum size`)
    context = p.context as Record<string, unknown>
  }
  return { documentType: sanitizeForPrompt(documentType), requirements: sanitizeForPrompt(requirements), context }
}

function validateChatPayload(payload: unknown): ChatPayload {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload')
  const p = payload as Record<string, unknown>
  if (!Array.isArray(p.messages)) throw new Error('messages must be an array')
  if (p.messages.length === 0) throw new Error('messages cannot be empty')
  if (p.messages.length > MAX_CHAT_MESSAGES) throw new Error(`messages exceeds maximum of ${MAX_CHAT_MESSAGES} messages`)

  const validRoles = ['user', 'assistant', 'system']
  const validatedMessages = p.messages.map((msg, index) => {
    if (!msg || typeof msg !== 'object') throw new Error(`messages[${index}] must be an object`)
    const m = msg as Record<string, unknown>
    if (typeof m.role !== 'string' || !validRoles.includes(m.role)) {
      throw new Error(`messages[${index}].role must be one of: ${validRoles.join(', ')}`)
    }
    const content = validateString(m.content, MAX_MESSAGE_LENGTH, `messages[${index}].content`)
    return { role: m.role, content: sanitizeForPrompt(content) }
  })

  let context: Record<string, unknown> | undefined
  if (p.context !== undefined) {
    if (typeof p.context !== 'object' || p.context === null) throw new Error('context must be an object')
    if (JSON.stringify(p.context).length > MAX_CONTEXT_SIZE) throw new Error(`context exceeds maximum size`)
    context = p.context as Record<string, unknown>
  }

  // Accept tool definitions from client
  let tools: ChatPayload['tools'] | undefined
  if (Array.isArray(p.tools) && p.tools.length > 0) {
    tools = p.tools as ChatPayload['tools']
  }

  return { messages: validatedMessages, context, tools }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })

    let requestBody: AIRequest
    try {
      requestBody = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { action, payload } = requestBody

    if (!action || !['generate_content', 'chat'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`AI operation requested: ${action} by user ${user.id}`)

    switch (action) {
      case 'generate_content': {
        let validatedPayload: GenerateContentPayload
        try {
          validatedPayload = validateGenerateContentPayload(payload)
        } catch (validationError) {
          return new Response(JSON.stringify({ error: validationError instanceof Error ? validationError.message : 'Invalid payload' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
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

        await supabase.from('tp_audit_log').insert({
          user_id: user.id, action: 'AI_CONTENT_GENERATION', resource_type: 'document_content',
          metadata: { document_type: documentType, content_length: generatedContent.length, model_used: 'gpt-4' }
        })

        return new Response(JSON.stringify({
          success: true, content: generatedContent,
          metadata: { model: 'gpt-4', content_length: generatedContent.length }
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'chat': {
        let validatedPayload: ChatPayload
        try {
          validatedPayload = validateChatPayload(payload)
        } catch (validationError) {
          return new Response(JSON.stringify({ error: validationError instanceof Error ? validationError.message : 'Invalid payload' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { messages, context, tools } = validatedPayload

        const systemMessage = {
          role: 'system' as const,
          content: `You are TaxStreamline AI, an expert tax and transfer pricing assistant. You help users with:
- Transfer pricing documentation and compliance
- Tax calculations and planning
- OECD guidelines and international tax matters
- Nigerian tax regulations (FIRS compliance)
- Document generation and review
- Calendar management, workflow automation, analytics

Current context: ${context ? JSON.stringify(context, null, 2) : 'None provided'}

IMPORTANT: When the user asks you to perform an action (create event, check compliance, navigate, calculate tax, etc.), you MUST use the appropriate function/tool call. Do not just describe what you would do - actually call the function.

Provide accurate, professional guidance while being helpful and conversational.`
        }

        // Build the OpenAI request with tool definitions if provided
        const openaiParams: any = {
          model: 'gpt-4',
          messages: [systemMessage, ...messages],
          max_tokens: 1500,
          temperature: 0.7,
        }

        // Add tools if provided by client
        if (tools && tools.length > 0) {
          openaiParams.tools = tools.map(t => ({
            type: 'function',
            function: {
              name: t.function.name,
              description: t.function.description,
              parameters: t.function.parameters,
            }
          }))
          openaiParams.tool_choice = 'auto'
        }

        const completion = await openai.chat.completions.create(openaiParams)

        const choice = completion.choices[0]
        const assistantMessage = choice?.message

        // Check if the model wants to call a tool/function
        if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
          const toolCall = assistantMessage.tool_calls[0]
          
          await supabase.from('tp_audit_log').insert({
            user_id: user.id, action: 'AI_FUNCTION_CALL', resource_type: 'chat_session',
            metadata: {
              function_name: toolCall.function.name,
              message_count: messages.length,
              model_used: 'gpt-4'
            }
          })

          return new Response(JSON.stringify({
            success: true,
            response: assistantMessage.content || '',
            function_call: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            },
            metadata: { model: 'gpt-4' }
          }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const assistantResponse = assistantMessage?.content || ''

        await supabase.from('tp_audit_log').insert({
          user_id: user.id, action: 'AI_CHAT_INTERACTION', resource_type: 'chat_session',
          metadata: { message_count: messages.length, response_length: assistantResponse.length, model_used: 'gpt-4' }
        })

        return new Response(JSON.stringify({
          success: true, response: assistantResponse, function_call: null,
          metadata: { model: 'gpt-4', response_length: assistantResponse.length }
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

  } catch (error: unknown) {
    console.error('AI operations error:', error)
    return new Response(JSON.stringify({ error: 'An error occurred processing your request. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
