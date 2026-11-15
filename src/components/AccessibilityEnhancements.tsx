import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function AccessibilityEnhancements() {
  const { pathname } = useLocation();
  useEffect(() => {
    const enhanceTables = () => document.querySelectorAll<HTMLElement>(".technical-table-wrap").forEach((region, index) => {
        region.tabIndex = 0;
        region.setAttribute("role", "region");
        if (!region.getAttribute("aria-label")) region.setAttribute("aria-label", `Scrollable technical table ${index + 1}`);
      });
    enhanceTables();
    const observer = new MutationObserver(enhanceTables);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
