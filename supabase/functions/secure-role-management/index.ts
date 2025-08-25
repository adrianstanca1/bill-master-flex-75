import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { action, targetUserId, newRole } = await req.json();

    // Verify current user is admin
    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (!adminCheck || adminCheck.role !== 'admin') {
      throw new Error('Only administrators can manage roles');
    }

    // Verify target user is in same company
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, company_id, full_name')
      .eq('id', targetUserId)
      .single();

    if (!targetUser || targetUser.company_id !== adminCheck.company_id) {
      throw new Error('Target user not found or not in same company');
    }

    // Prevent self-role changes
    if (user.id === targetUserId) {
      throw new Error('Cannot change your own role');
    }

    switch (action) {
      case 'update_role': {
        // Validate role change
        if (!['admin', 'manager', 'member'].includes(newRole)) {
          throw new Error('Invalid role specified');
        }

        // Update the role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', targetUserId);

        if (updateError) throw updateError;

        // Log the successful role change
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          action: 'ROLE_CHANGE_SUCCESS',
          resource_type: 'user_management',
          resource_id: targetUserId,
          details: {
            old_role: targetUser.role,
            new_role: newRole,
            target_user_name: targetUser.full_name,
            admin_id: user.id,
            timestamp: new Date().toISOString()
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Role updated to ${newRole}`,
            targetUserId,
            newRole
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      case 'get_company_users': {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .eq('company_id', adminCheck.company_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, users }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Secure role management error:', error);

    // Log security violation
    await supabase.from('security_audit_log').insert({
      action: 'ROLE_MANAGEMENT_VIOLATION',
      resource_type: 'security',
      details: {
        error: error.message,
        timestamp: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for')
      }
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});