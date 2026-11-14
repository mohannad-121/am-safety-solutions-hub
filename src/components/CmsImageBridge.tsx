import { useEffect } from "react";
import { useCmsImages } from "@/hooks/use-cms";

export function CmsImageBridge() {
  const { image, slots } = useCmsImages();

  useEffect(() => {
    const updateElement = (element: Element) => {
      if (element instanceof HTMLImageElement) {
        const source = element.dataset.cmsSource || element.getAttribute("src") || "";
        if (!source || source.startsWith("data:") || source.startsWith("blob:")) return;
        element.dataset.cmsSource = source.split("?")[0];
        const resolved = image(element.dataset.cmsSource);
        if (resolved && element.getAttribute("src") !== resolved) element.setAttribute("src", resolved);
      }
      if (element instanceof HTMLVideoElement) {
        const source = element.dataset.cmsPoster || element.getAttribute("poster") || "";
        if (!source) return;
        element.dataset.cmsPoster = source.split("?")[0];
        const resolved = image(element.dataset.cmsPoster);
        if (resolved && element.getAttribute("poster") !== resolved) element.setAttribute("poster", resolved);
      }
      if (element instanceof HTMLElement && element.style.backgroundImage.includes("url(")) {
        const match = element.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        if (match?.[1]) {
          const source = element.dataset.cmsBackground || match[1].split("?")[0];
          element.dataset.cmsBackground = source;
          const resolved = image(source);
          if (resolved !== source) element.style.backgroundImage = `url("${resolved}")`;
        }
      }
    };
    const scan = (root: ParentNode) => {
      if (root instanceof Element) updateElement(root);
      root.querySelectorAll("img, video[poster], [style*='background-image']").forEach(updateElement);
    };
    scan(document);
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node instanceof Element) scan(node); })));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [image, slots]);

  return null;
}
