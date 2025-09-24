// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, subject, html } = await req.json();

    if (!user_id || !subject || !html) {
      throw new Error('Missing required fields: user_id, subject, html');
    }

    // Create admin client to access auth.users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
    
    if (userError || !userData.user?.email) {
      throw new Error('User email not found');
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const data = await resend.emails.send({
      from: "PetTrackCare <onboarding@resend.dev>", // Use Resend's default verified domain
      to: [userData.user.email],
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Email sending error:', err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
