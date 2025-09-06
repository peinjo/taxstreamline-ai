import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import OpenAI from 'https://esm.sh/openai@4.73.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  action: 'generate_content' | 'chat'
  payload: any
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

    // Parse request body
    const { action, payload }: AIRequest = await req.json()

    console.log(`AI operation requested: ${action} by user ${user.id}`)

    switch (action) {
      case 'generate_content': {
        const { documentType, requirements, context } = payload

        const systemPrompt = `You are an expert transfer pricing consultant. Generate professional, OECD-compliant transfer pricing documentation content.

Document Type: ${documentType}
Requirements: ${requirements}
Context: ${JSON.stringify(context, null, 2)}

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
        const { messages, context } = payload

        const systemMessage = {
          role: 'system',
          content: `You are TaxStreamline AI, an expert tax and transfer pricing assistant. You help users with:
- Transfer pricing documentation and compliance
- Tax calculations and planning
- OECD guidelines and international tax matters
- Nigerian tax regulations (FIRS compliance)
- Document generation and review

Current context: ${JSON.stringify(context, null, 2)}

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

  } catch (error) {
    console.error('AI operations error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})