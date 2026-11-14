import { useEffect, useMemo, useState } from "react";
import {
  CMS_UPDATED_EVENT,
  fetchContent,
  fetchImageSlots,
  getCachedContent,
  getCachedImageSlots,
  resolvePublishedImage,
  type CmsContentRecord,
  type ImageSlot,
} from "@/lib/cms";

export function useCmsImages() {
  const [slots, setSlots] = useState<ImageSlot[]>(getCachedImageSlots);

  useEffect(() => {
    let active = true;
    const refresh = () => fetchImageSlots().then(items => active && setSlots(items));
    refresh();
    window.addEventListener(CMS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener(CMS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return useMemo(() => ({ slots, image: (fallbackUrl: string) => resolvePublishedImage(fallbackUrl, slots) }), [slots]);
}

export function useCmsContent() {
  const [records, setRecords] = useState<CmsContentRecord[]>(getCachedContent);

  useEffect(() => {
    let active = true;
    const refresh = () => fetchContent().then(items => active && setRecords(items));
    refresh();
    window.addEventListener(CMS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener(CMS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return records;
}
