// @deno-types="https://deno.land/x/types/index.d.ts"
// supabase/functions/send-email/index.ts
// deno-lint-ignore-file no-explicit-any

// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore: Supabase types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore: Resend types
import { Resend } from "https://esm.sh/resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  user_id: string;
  subject: string;
  html: string;
}

// @ts-ignore: Deno.serve types
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, subject, html } = await req.json() as EmailRequest;

    // Validate required fields
    if (!user_id || !subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: user_id, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get environment variables
    // @ts-ignore: Deno global
    const supabaseUrl = (globalThis as any).Deno?.env?.get('SUPABASE_URL');
    // @ts-ignore: Deno global
    const supabaseServiceRoleKey = (globalThis as any).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY');
    // @ts-ignore: Deno global
    const resendApiKey = (globalThis as any).Deno?.env?.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user?.email) {
      console.error('User lookup error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email via Resend
    const resend = new Resend(resendApiKey);
    const emailData = await resend.emails.send({
      from: 'PetTrackCare <onboarding@resend.dev>',
      to: userData.user.email,
      subject: subject,
      html: html,
    });

    if (emailData.error) {
      console.error('Resend error:', emailData.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
