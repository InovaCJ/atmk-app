import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
  clientId: string;
  email: string;
  role: 'client_admin' | 'editor' | 'viewer';
  invitedByName: string;
  clientName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { clientId, email, role, invitedByName, clientName }: InviteRequest = await req.json()

    if (!clientId || !email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify user has admin access to this client
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('client_members')
      .select('role')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .eq('role', 'client_admin')
      .single()

    if (memberError || !memberCheck) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Check if user is already a member
      const { data: existingMember } = await supabaseClient
        .from('client_members')
        .select('id')
        .eq('client_id', clientId)
        .eq('user_id', existingUser.user_id)
        .single()

      if (existingMember) {
        return new Response(
          JSON.stringify({ error: 'User is already a member of this client' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Create invite
    const { data: invite, error: inviteError } = await supabaseClient
      .from('client_invites')
      .insert({
        client_id: clientId,
        email: email,
        role: role,
        invited_by: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return new Response(
        JSON.stringify({ error: 'Failed to create invite' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email (simulated for now - in production, integrate with email service)
    const inviteLink = `${Deno.env.get('SITE_URL')}/invite/${invite.token}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Você foi convidado para colaborar no ATMK!</h2>
        
        <p>Olá!</p>
        
        <p><strong>${invitedByName}</strong> convidou você para colaborar na empresa <strong>"${clientName}"</strong> no ATMK.</p>
        
        <p><strong>Sua função será:</strong> ${getRoleLabel(role)}</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Permissões da função:</h3>
          <ul>
            ${getRolePermissions(role).map(permission => `<li>${permission}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Aceitar Convite
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Este convite expira em 7 dias. Se você não tem uma conta no ATMK, será criada automaticamente.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Se você não esperava este convite, pode ignorar este email.
        </p>
      </div>
    `

    // TODO: Integrate with actual email service (SendGrid, Resend, etc.)
    console.log('Email would be sent to:', email)
    console.log('Invite link:', inviteLink)
    console.log('Email content:', emailContent)

    return new Response(
      JSON.stringify({ 
        success: true, 
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          expires_at: invite.expires_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in invite function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function getRoleLabel(role: string): string {
  switch (role) {
    case 'client_admin':
      return 'Administrador'
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Visualizador'
    default:
      return role
  }
}

function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'client_admin':
      return [
        'Gerenciar todos os aspectos da empresa',
        'Adicionar e remover membros',
        'Alterar configurações da empresa',
        'Editar base de conhecimento',
        'Visualizar todos os conteúdos'
      ]
    case 'editor':
      return [
        'Adicionar e editar inputs',
        'Gerenciar base de conhecimento',
        'Visualizar todos os conteúdos',
        'Gerar conteúdo'
      ]
    case 'viewer':
      return [
        'Visualizar conteúdos e resultados',
        'Acessar base de conhecimento'
      ]
    default:
      return []
  }
}
