import { supabase } from "@/integrations/supabase/client";

export type Ga4Report = {
  connected: true;
  checkedAt: string;
  propertyId: string;
  summary: {
    sessionsToday: number;
    pageViewsToday: number;
    activeUsers30m: number;
    users7d: number;
    users30d: number;
    pageViews30d: number;
    engagementRate30d: number;
    whatsappClicks30d: number;
  };
  topPages: Array<{ name: string; value: number }>;
  channels: Array<{ name: string; value: number }>;
  countries: Array<{ name: string; value: number }>;
  devices: Array<{ name: string; value: number }>;
};

export async function fetchGa4Report(force = false): Promise<Ga4Report> {
  const { data, error } = await supabase.functions.invoke("ga4-reports", { body: { action: "report", force } });
  if (error) {
    const response = (error as typeof error & { context?: Response }).context;
    const detail = response instanceof Response ? await response.json().catch(() => null) as { error?: string } | null : null;
    throw new Error(detail?.error || `GA4 report request failed: ${error.message}`);
  }
  if (data?.error) throw new Error(String(data.error));
  if (!data?.connected) throw new Error(String(data?.reason || "GA4 reporting is not configured."));
  return data as Ga4Report;
}
