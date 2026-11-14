import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { MAX_LEAD_FILES, MAX_LEAD_FILE_SIZE } from "@/components/forms/LeadAttachments";

export type WebsiteLead = TablesInsert<"website_leads">;

const allowedExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp", "dwg", "dxf"]);

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "project-file";
}

export async function submitWebsiteLead(lead: WebsiteLead, files: File[] = []) {
  if (files.length > MAX_LEAD_FILES) throw new Error(`A maximum of ${MAX_LEAD_FILES} files is allowed.`);

  const leadId = lead.id || crypto.randomUUID();
  const attachmentPaths: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.has(extension)) throw new Error(`${file.name} is not a supported project file.`);
    if (file.size > MAX_LEAD_FILE_SIZE) throw new Error(`${file.name} is larger than 10 MB.`);

    const path = `website-leads/${leadId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("lead-attachments").upload(path, file, { upsert: false });
    if (uploadError) throw uploadError;
    attachmentPaths.push(path);
  }

  const leadRecord: WebsiteLead = attachmentPaths.length
    ? { ...lead, id: leadId, attachment_paths: attachmentPaths }
    : { ...lead, id: leadId };
  const { error } = await supabase.from("website_leads").insert(leadRecord);
  if (error) throw error;

  // Notification is best-effort: a submitted lead remains stored if email delivery is unavailable.
  supabase.functions.invoke("notify-lead", { body: leadRecord }).catch(() => undefined);
}

