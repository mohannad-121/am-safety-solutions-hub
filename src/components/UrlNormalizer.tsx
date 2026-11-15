import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizePublicPath } from "@/lib/canonical";

const aliases: Record<string, string> = {
  "/standards": "/standards/en-13374-edge-protection",
  "/en-13374-edge-protection": "/standards/en-13374-edge-protection",
  "/bs-en-13374-2025-edge-protection": "/standards/en-13374-edge-protection",
  "/certifications": "/standards/en-13374-edge-protection",
  "/edge-protection-faqs": "/faq",
};

export function UrlNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const normalized = normalizePublicPath(location.pathname);
    const target = aliases[normalized] || normalized;
    if (target !== location.pathname) navigate(`${target}${location.search}`, { replace: true });
  }, [location.pathname, location.search, navigate]);
  return null;
}
