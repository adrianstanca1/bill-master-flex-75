// Get environment-specific CORS origin for enhanced security
const getAllowedOrigin = () => {
  const projectRef = 'zwxyoeqsbntsogvgwily';
  const allowedOrigins = [
    'https://lovable.dev',
    `https://${projectRef}.supabase.co`,
    'https://project.lovable.app'
  ];
  
  // In production, restrict to specific domains only
  return allowedOrigins.join(', ');
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};