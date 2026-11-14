type LeadNotification = {
  id: string;
  lead_type: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  products?: string[];
  project_location?: string | null;
  attachment_paths?: string[];
};

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  try {
    const lead = await request.json() as LeadNotification;
    if (!lead.id || !lead.name || !lead.email) return new Response("Invalid lead", { status: 400, headers: corsHeaders });
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const recipient = Deno.env.get("LEAD_NOTIFICATION_EMAIL");
    const sender = Deno.env.get("LEAD_NOTIFICATION_FROM") || "AMBS Website <onboarding@resend.dev>";
    if (!apiKey || !recipient) return new Response(null, { status: 204, headers: corsHeaders });
    const escapeHtml = (value: unknown) => String(value).replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character] || character);
    const details = [["Lead type", lead.lead_type], ["Name", lead.name], ["Email", lead.email], ["Company", lead.company], ["Phone", lead.phone], ["Products", lead.products?.join(", ")], ["Project location", lead.project_location], ["Attachments", lead.attachment_paths?.length ? `${lead.attachment_paths.length} private file(s) in Supabase Storage` : "None"], ["Message", lead.message]].filter(([, value]) => value).map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: sender, to: [recipient], reply_to: lead.email, subject: lead.subject || `New ${lead.lead_type} lead from ${lead.name}`, html: `<h1>New AMBS website lead</h1>${details}` }) });
    if (!response.ok) throw new Error(await response.text());
    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return new Response("Unable to notify lead", { status: 500, headers: corsHeaders });
  }
});
