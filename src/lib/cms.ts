import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const client = supabase as unknown as SupabaseClient;
export const remoteCmsEnabled = import.meta.env.VITE_CMS_REMOTE_ENABLED === "true";

export type CmsRole = "super_admin" | "admin" | "seo_reviewer" | "content_editor" | "media_manager" | "sales_marketing_draft";
export type CmsStatus = "draft" | "review" | "published" | "archived";
export type ImageLiveStatus = "Live" | "Draft" | "Static Not Connected" | "Broken";

export type CmsAdminUser = {
  id: string;
  email: string;
  role: CmsRole;
  mfaRequired: boolean;
};

export type ImageVersion = {
  id: string;
  versionNumber: number;
  imageUrl: string;
  fileName: string;
  altText: string;
  status: "original" | "draft" | "published" | "rollback";
  createdAt: string;
  createdBy: string;
};

export type ImageSlot = {
  id: string;
  pageName: string;
  pageSlug: string;
  sectionName: string;
  componentName: string;
  imageRole: string;
  productName?: string;
  sourceFile: string;
  originalImageUrl: string;
  publishedImageUrl: string;
  draftImageUrl?: string;
  altText: string;
  draftAltText?: string;
  caption: string;
  category: string;
  usedOn: string[];
  requiredAspectRatio: string;
  recommendedWidth: number;
  recommendedHeight: number;
  minimumWidth: number;
  minimumHeight: number;
  cropMode: "cover" | "contain" | "fill" | "original";
  focalPointX: number;
  focalPointY: number;
  isPublic: boolean;
  isEditable: boolean;
  isPublished: boolean;
  updatedAt: string;
  updatedBy: string;
  versions: ImageVersion[];
};

export type CmsContentRecord = {
  id: string;
  contentKey: string;
  contentType: "page" | "product" | "project" | "resource" | "document" | "article" | "faq" | "training";
  title: string;
  slug: string;
  status: CmsStatus;
  draftData: Record<string, unknown>;
  publishedData: Record<string, unknown>;
  seoData: Record<string, unknown>;
  updatedAt: string;
  updatedBy: string;
};

export type AuditEntry = {
  id: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: string;
  createdAt: string;
  oldValue?: unknown;
  newValue?: unknown;
};

export const CMS_IMAGE_STORAGE_KEY = "ambs_cms_image_slots_v2";
export const CMS_CONTENT_STORAGE_KEY = "ambs_cms_content_v2";
export const CMS_AUDIT_STORAGE_KEY = "ambs_cms_audit_v2";
export const CMS_UPDATED_EVENT = "ambs:cms-updated";

const now = "2026-11-13T00:00:00.000Z";

function imageSlot(
  id: string,
  url: string,
  pageName: string,
  sectionName: string,
  imageRole: string,
  category: string,
  usedOn: string[],
  altText: string,
  sourceFile = "src/data/ambs.ts",
  ratio = "4:3",
  width = 1200,
  height = 900,
): ImageSlot {
  return {
    id,
    pageName,
    pageSlug: usedOn[0] || "/",
    sectionName,
    componentName: sectionName,
    imageRole,
    sourceFile,
    originalImageUrl: url,
    publishedImageUrl: url,
    altText,
    caption: "",
    category,
    usedOn,
    requiredAspectRatio: ratio,
    recommendedWidth: width,
    recommendedHeight: height,
    minimumWidth: Math.round(width * 0.67),
    minimumHeight: Math.round(height * 0.67),
    cropMode: "cover",
    focalPointX: 50,
    focalPointY: 50,
    isPublic: true,
    isEditable: true,
    isPublished: true,
    updatedAt: now,
    updatedBy: "Repository seed",
    versions: [{ id: `${id}-v1`, versionNumber: 1, imageUrl: url, fileName: url.split("/").pop() || id, altText, status: "original", createdAt: now, createdBy: "Repository seed" }],
  };
}

export const defaultImageSlots: ImageSlot[] = [
  imageSlot("brand.logo.main", "/assets/brand/ambs-logo.svg", "Global", "Header and Footer", "logo-main", "Logo / Branding", ["/", "all public pages"], "AM Building Solutions", "src/components/layout/Navbar.tsx", "8:3", 960, 360),
  imageSlot("brand.mark", "/assets/brand/ambs-mark.svg", "Global", "Brand Mark", "logo-mark", "Logo / Branding", ["admin login", "social previews"], "AMBS brand mark", "public/assets/brand/ambs-mark.svg", "1:1", 512, 512),
  imageSlot("homepage.hero.poster", "/assets/images/landing-hero-poster.jpg", "Homepage", "Hero", "hero-video-poster", "Hero Images", ["/"], "AM Building Solutions construction safety systems for UAE projects", "src/components/home/HeroSection.tsx", "16:9", 1920, 1080),
  imageSlot("about.hero.poster", "/assets/images/about-hero-poster.jpg", "About Us", "Hero", "hero-video-poster", "Hero Images", ["/about"], "AM Building Solutions construction safety systems", "src/pages/About.tsx", "16:9", 1920, 1080),
  imageSlot("shared.edge-protection", "/assets/images/edge-protection-systems.jpg", "Products", "Edge Protection", "product-card-front", "Product Images", ["/", "/products", "/projects", "/articles"], "Temporary edge protection systems for UAE construction projects"),
  imageSlot("shared.safety-nets", "/assets/images/safety-net-systems.jpg", "Products", "Safety Nets", "product-card-front", "Product Images", ["/", "/products", "/projects", "/articles"], "Construction safety net systems for high-rise projects"),
  imageSlot("shared.loading-platforms", "/assets/images/loading-platforms.jpg", "Products", "Loading Platforms", "product-card-front", "Product Images", ["/", "/products", "/projects", "/articles"], "Construction loading platform for material handling"),
  imageSlot("shared.project-support", "/assets/images/project-support.jpg", "Projects", "Project Support", "project-photo", "Project Photos", ["/", "/about", "/projects", "/articles"], "AMBS project support for construction safety systems"),
  imageSlot("shared.shaft-gates", "/assets/images/shaft-hoist-gates.jpg", "Products", "Shaft and Hoist Gates", "product-card-front", "Product Images", ["/products", "/projects", "/articles"], "Shaft and hoist gate protection for construction openings"),
  imageSlot("shared.steel-fabrication", "/assets/images/steel-fabrication.jpg", "Products", "Steel Fabrication", "product-card-front", "Product Images", ["/", "/about", "/products", "/projects"], "Custom steel fabrication for temporary works"),
  imageSlot("shared.hero-poster", "/assets/images/hero-poster.jpg", "Homepage", "Product hover and About", "product-card-hover", "Hover / Flip Images", ["/", "/about"], "Construction safety project in the UAE", "src/components/home/HomeFeatureSections.tsx", "16:9", 1600, 900),
];

export const defaultContentRecords: CmsContentRecord[] = [
  { id: "page-home", contentKey: "page.home", contentType: "page", title: "Homepage", slug: "", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "page-about", contentKey: "page.about", contentType: "page", title: "About Us", slug: "about", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "page-products", contentKey: "page.products", contentType: "page", title: "Products & Solutions", slug: "products", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "product-safety-nets", contentKey: "product.safety-nets", contentType: "product", title: "Safety Net Systems", slug: "products/safety-nets", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "product-edge-protection", contentKey: "product.edge-protection", contentType: "product", title: "Edge Protection Systems", slug: "edge-protection-systems-uae", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "project-library", contentKey: "project.library", contentType: "project", title: "Projects / Case Studies", slug: "projects", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "article-library", contentKey: "article.library", contentType: "article", title: "Articles", slug: "articles", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "faq-library", contentKey: "faq.library", contentType: "faq", title: "FAQs", slug: "faq", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "resource-library", contentKey: "resource.library", contentType: "resource", title: "Resources & Downloads", slug: "edge-protection-downloads", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
  { id: "training-center", contentKey: "training.center", contentType: "training", title: "Training Center", slug: "edge-protection-training", status: "published", draftData: {}, publishedData: {}, seoData: { protected: true }, updatedAt: now, updatedBy: "Repository seed" },
];

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CMS_UPDATED_EVENT));
}

function mergeImageSeeds(stored: ImageSlot[]) {
  const storedById = new Map(stored.map(slot => [slot.id, slot]));
  return [...defaultImageSlots.map(slot => storedById.get(slot.id) || slot), ...stored.filter(slot => !defaultImageSlots.some(seed => seed.id === slot.id))];
}

export function getCachedImageSlots() {
  return mergeImageSeeds(readLocal<ImageSlot[]>(CMS_IMAGE_STORAGE_KEY, defaultImageSlots));
}

export function resolvePublishedImage(fallbackUrl: string, slots = getCachedImageSlots()) {
  const cleanFallback = fallbackUrl.split("?")[0];
  const slot = slots.find(item => item.id === fallbackUrl || item.originalImageUrl.split("?")[0] === cleanFallback);
  return slot?.publishedImageUrl || fallbackUrl;
}

export async function fetchImageSlots() {
  const fallback = getCachedImageSlots();
  if (!remoteCmsEnabled) return fallback;
  if (remoteCmsEnabled) try {
    const { data, error } = await client.from("cms_image_slots").select("*").order("page_name");
    if (error || !data?.length) return fallback;
    const versionsResult = await client.from("cms_image_versions").select("*").order("version_number");
    const mapped = data.map(row => mapSlotFromDatabase(row as Record<string, unknown>, (versionsResult.data || []) as Record<string, unknown>[]));
    const merged = mergeImageSeeds(mapped);
    writeLocal(CMS_IMAGE_STORAGE_KEY, merged);
    return merged;
  } catch {
    return fallback;
  }
}

function mapSlotFromDatabase(row: Record<string, unknown>, versions: Record<string, unknown>[]): ImageSlot {
  return {
    id: String(row.id), pageName: String(row.page_name), pageSlug: String(row.page_slug || ""), sectionName: String(row.section_name), componentName: String(row.component_name), imageRole: String(row.image_role),
    productName: row.product_name ? String(row.product_name) : undefined, sourceFile: String(row.source_file || "CMS"), originalImageUrl: String(row.original_image_url), publishedImageUrl: String(row.published_image_url), draftImageUrl: row.draft_image_url ? String(row.draft_image_url) : undefined,
    altText: String(row.alt_text || ""), draftAltText: row.draft_alt_text ? String(row.draft_alt_text) : undefined, caption: String(row.caption || ""), category: String(row.category), usedOn: Array.isArray(row.used_on) ? row.used_on.map(String) : [], requiredAspectRatio: String(row.required_aspect_ratio || "4:3"),
    recommendedWidth: Number(row.recommended_width || 1200), recommendedHeight: Number(row.recommended_height || 900), minimumWidth: Number(row.minimum_width || 800), minimumHeight: Number(row.minimum_height || 600), cropMode: (row.crop_mode || "cover") as ImageSlot["cropMode"], focalPointX: Number(row.focal_point_x || 50), focalPointY: Number(row.focal_point_y || 50),
    isPublic: Boolean(row.is_public), isEditable: Boolean(row.is_editable), isPublished: Boolean(row.is_published), updatedAt: String(row.updated_at || now), updatedBy: String(row.updated_by || "CMS"),
    versions: versions.filter(version => version.slot_id === row.id).map(version => ({ id: String(version.id), versionNumber: Number(version.version_number), imageUrl: String(version.image_url), fileName: String(version.file_name), altText: String(version.alt_text || ""), status: version.status as ImageVersion["status"], createdAt: String(version.created_at), createdBy: String(version.created_by || "CMS") })),
  };
}

function mapSlotToDatabase(slot: ImageSlot) {
  return { id: slot.id, page_name: slot.pageName, page_slug: slot.pageSlug, section_name: slot.sectionName, component_name: slot.componentName, image_role: slot.imageRole, product_name: slot.productName || null, source_file: slot.sourceFile, original_image_url: slot.originalImageUrl, published_image_url: slot.publishedImageUrl, draft_image_url: slot.draftImageUrl || null, alt_text: slot.altText, draft_alt_text: slot.draftAltText || null, caption: slot.caption, category: slot.category, used_on: slot.usedOn, required_aspect_ratio: slot.requiredAspectRatio, recommended_width: slot.recommendedWidth, recommended_height: slot.recommendedHeight, minimum_width: slot.minimumWidth, minimum_height: slot.minimumHeight, crop_mode: slot.cropMode, focal_point_x: slot.focalPointX, focal_point_y: slot.focalPointY, is_public: slot.isPublic, is_editable: slot.isEditable, is_published: slot.isPublished, updated_at: slot.updatedAt };
}

export function imageLiveStatus(slot: ImageSlot): ImageLiveStatus {
  if (!slot.publishedImageUrl) return "Broken";
  if (!slot.isEditable) return "Static Not Connected";
  if (slot.draftImageUrl) return "Draft";
  return "Live";
}

export function validateMediaFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "pdf"]);
  const allowedMime = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
  if (!allowedExtensions.has(extension) || !allowedMime.has(file.type)) throw new Error("Upload failed: unsupported file type. Use JPG, PNG, WebP, GIF or PDF.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Upload failed: file is larger than 12 MB.");
}

async function validateMagicBytes(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const signatures = [
    bytes[0] === 0xff && bytes[1] === 0xd8,
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
    String.fromCharCode(...bytes.slice(0, 4)) === "GIF8",
    String.fromCharCode(...bytes.slice(0, 4)) === "%PDF",
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
  ];
  if (!signatures.some(Boolean)) throw new Error("Upload failed: file contents do not match an approved image or PDF format.");
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read uploaded file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadCmsAsset(file: File, slotId: string) {
  if (!remoteCmsEnabled && !import.meta.env.DEV) {
    throw new Error("Production publishing is not configured. Enable VITE_CMS_REMOTE_ENABLED after applying the Supabase migrations.");
  }
  validateMediaFile(file);
  await validateMagicBytes(file);
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safePath = `${slotId.replace(/[^a-z0-9.-]/gi, "-")}/${crypto.randomUUID()}.${extension}`;
  if (remoteCmsEnabled) {
    const { error } = await client.storage.from("cms-media").upload(safePath, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (error) throw new Error(`Media storage rejected the upload: ${error.message}`);
    return client.storage.from("cms-media").getPublicUrl(safePath).data.publicUrl;
  }
  return fileToDataUrl(file);
}

export async function saveImageDraft(slots: ImageSlot[], slotId: string, file: File, user: CmsAdminUser, updates: Partial<ImageSlot>) {
  if (!canManageMedia(user.role)) throw new Error("You do not have permission to replace images.");
  const imageUrl = await uploadCmsAsset(file, slotId);
  const timestamp = new Date().toISOString();
  const next = slots.map(slot => slot.id === slotId ? { ...slot, ...updates, draftImageUrl: imageUrl, draftAltText: updates.altText ?? slot.altText, updatedAt: timestamp, updatedBy: user.email, versions: [...slot.versions, { id: crypto.randomUUID(), versionNumber: slot.versions.length + 1, imageUrl, fileName: file.name, altText: updates.altText ?? slot.altText, status: "draft" as const, createdAt: timestamp, createdBy: user.email }] } : slot);
  writeLocal(CMS_IMAGE_STORAGE_KEY, next);
  const changed = next.find(slot => slot.id === slotId)!;
  if (remoteCmsEnabled) try {
    const slotResult = await client.from("cms_image_slots").upsert(mapSlotToDatabase(changed));
    if (slotResult.error) throw slotResult.error;
    const versionResult = await client.from("cms_image_versions").insert({ slot_id: slotId, version_number: changed.versions.length, image_url: imageUrl, file_name: file.name, alt_text: changed.draftAltText || changed.altText, status: "draft", created_by: user.id });
    if (versionResult.error) throw versionResult.error;
    await recordAudit(user, "image.uploaded", "image_slot", slotId, undefined, { imageUrl, fileName: file.name });
  } catch (error) {
    throw new Error(`Draft could not be saved to Supabase: ${error instanceof Error ? error.message : "database error"}`);
  }
  return next;
}

export async function publishImage(slots: ImageSlot[], slotId: string, user: CmsAdminUser) {
  if (!remoteCmsEnabled && !import.meta.env.DEV) throw new Error("Production publishing is not configured. Apply the Supabase migrations and enable the remote CMS first.");
  if (!canPublish(user.role)) throw new Error("You do not have permission to apply images to the live website.");
  const current = slots.find(slot => slot.id === slotId);
  if (!current?.draftImageUrl) throw new Error("No draft image is ready to publish.");
  if (!(current.draftAltText || current.altText).trim()) throw new Error("Alt text is required before publishing.");
  const timestamp = new Date().toISOString();
  const separator = current.draftImageUrl.includes("?") ? "&" : "?";
  const liveUrl = current.draftImageUrl.startsWith("data:") ? current.draftImageUrl : `${current.draftImageUrl}${separator}v=${Date.now()}`;
  const next = slots.map(slot => slot.id === slotId ? { ...slot, publishedImageUrl: liveUrl, draftImageUrl: undefined, altText: slot.draftAltText || slot.altText, draftAltText: undefined, isPublished: true, updatedAt: timestamp, updatedBy: user.email, versions: [...slot.versions, { id: crypto.randomUUID(), versionNumber: slot.versions.length + 1, imageUrl: liveUrl, fileName: liveUrl.split("/").pop() || slot.id, altText: slot.draftAltText || slot.altText, status: "published" as const, createdAt: timestamp, createdBy: user.email }] } : slot);
  writeLocal(CMS_IMAGE_STORAGE_KEY, next);
  const changed = next.find(slot => slot.id === slotId)!;
  if (remoteCmsEnabled) try {
    const slotResult = await client.from("cms_image_slots").upsert(mapSlotToDatabase(changed));
    if (slotResult.error) throw slotResult.error;
    const versionResult = await client.from("cms_image_versions").insert({ slot_id: slotId, version_number: changed.versions.length, image_url: liveUrl, file_name: liveUrl.split("/").pop() || slotId, alt_text: changed.altText, status: "published", created_by: user.id });
    if (versionResult.error) throw versionResult.error;
    await recordAudit(user, "image.applied_to_website", "image_slot", slotId, { imageUrl: current.publishedImageUrl }, { imageUrl: liveUrl });
    await recordAudit(user, "image.cache_revalidated", "image_slot", slotId, undefined, { cacheBuster: liveUrl });
  } catch (error) {
    throw new Error(`Image could not be published to Supabase: ${error instanceof Error ? error.message : "database error"}`);
  }
  return next;
}

export async function rollbackImage(slots: ImageSlot[], slotId: string, user: CmsAdminUser) {
  if (!remoteCmsEnabled && !import.meta.env.DEV) throw new Error("Production rollback is not configured. Apply the Supabase migrations and enable the remote CMS first.");
  if (!canPublish(user.role)) throw new Error("You do not have permission to rollback live images.");
  const current = slots.find(slot => slot.id === slotId);
  if (!current) throw new Error("Image slot not found.");
  const prior = [...current.versions].reverse().find(version => ["original", "published", "rollback"].includes(version.status) && version.imageUrl.split("?")[0] !== current.publishedImageUrl.split("?")[0]);
  if (!prior) throw new Error("No previous published image is available.");
  const timestamp = new Date().toISOString();
  const separator = prior.imageUrl.includes("?") ? "&" : "?";
  const liveUrl = prior.imageUrl.startsWith("data:") ? prior.imageUrl : `${prior.imageUrl}${separator}v=${Date.now()}`;
  const next = slots.map(slot => slot.id === slotId ? { ...slot, publishedImageUrl: liveUrl, draftImageUrl: undefined, altText: prior.altText || slot.altText, updatedAt: timestamp, updatedBy: user.email, versions: [...slot.versions, { ...prior, id: crypto.randomUUID(), versionNumber: slot.versions.length + 1, imageUrl: liveUrl, status: "rollback" as const, createdAt: timestamp, createdBy: user.email }] } : slot);
  writeLocal(CMS_IMAGE_STORAGE_KEY, next);
  const changed = next.find(slot => slot.id === slotId)!;
  if (remoteCmsEnabled) try {
    const slotResult = await client.from("cms_image_slots").upsert(mapSlotToDatabase(changed));
    if (slotResult.error) throw slotResult.error;
    const versionResult = await client.from("cms_image_versions").insert({ slot_id: slotId, version_number: changed.versions.length, image_url: liveUrl, file_name: prior.fileName, alt_text: changed.altText, status: "rollback", created_by: user.id });
    if (versionResult.error) throw versionResult.error;
    await recordAudit(user, "image.rollback", "image_slot", slotId, { imageUrl: current.publishedImageUrl }, { imageUrl: liveUrl });
  } catch (error) {
    throw new Error(`Rollback could not be saved to Supabase: ${error instanceof Error ? error.message : "database error"}`);
  }
  return next;
}

export function getCachedContent() {
  const stored = readLocal<CmsContentRecord[]>(CMS_CONTENT_STORAGE_KEY, defaultContentRecords);
  return [...defaultContentRecords.map(seed => stored.find(item => item.contentKey === seed.contentKey) || seed), ...stored.filter(item => !defaultContentRecords.some(seed => seed.contentKey === item.contentKey))];
}

export async function fetchContent() {
  const fallback = getCachedContent();
  if (!remoteCmsEnabled) return fallback;
  if (remoteCmsEnabled) try {
    const { data, error } = await client.from("cms_content").select("*").order("content_type");
    if (error || !data?.length) return fallback;
    const mapped: CmsContentRecord[] = data.map(row => ({ id: String(row.id), contentKey: String(row.content_key), contentType: row.content_type as CmsContentRecord["contentType"], title: String(row.title), slug: String(row.slug || ""), status: row.status as CmsStatus, draftData: row.draft_data || {}, publishedData: row.published_data || {}, seoData: row.seo_data || {}, updatedAt: String(row.updated_at), updatedBy: String(row.updated_by || "CMS") }));
    writeLocal(CMS_CONTENT_STORAGE_KEY, mapped);
    return mapped;
  } catch {
    return fallback;
  }
}

export async function saveContentRecord(records: CmsContentRecord[], record: CmsContentRecord, user: CmsAdminUser, publish = false) {
  if (!remoteCmsEnabled && !import.meta.env.DEV) throw new Error("Production content storage is not configured. Apply the Supabase migrations and enable VITE_CMS_REMOTE_ENABLED first.");
  if (publish && !canPublish(user.role)) throw new Error("Only Admin and Super Admin can publish.");
  if (!canEditContent(user.role)) throw new Error("You do not have permission to edit content.");
  const timestamp = new Date().toISOString();
  const saved = { ...record, status: publish ? "published" as const : record.status, publishedData: publish ? record.draftData : record.publishedData, updatedAt: timestamp, updatedBy: user.email };
  const next = records.some(item => item.id === saved.id) ? records.map(item => item.id === saved.id ? saved : item) : [saved, ...records];
  writeLocal(CMS_CONTENT_STORAGE_KEY, next);
  if (remoteCmsEnabled) try {
    const previous = records.find(item => item.contentKey === saved.contentKey) || record;
    const versionResult = await client.from("cms_content_versions").insert({ content_key: previous.contentKey, content_type: previous.contentType, title: previous.title, slug: previous.slug, status: previous.status, draft_data: previous.draftData, published_data: previous.publishedData, seo_data: previous.seoData, change_type: publish ? "publish" : "draft", created_by: user.id });
    if (versionResult.error) throw versionResult.error;
    const saveResult = await client.from("cms_content").upsert({ id: saved.id.startsWith("new-") ? undefined : saved.id, content_key: saved.contentKey, content_type: saved.contentType, title: saved.title, slug: saved.slug, status: saved.status, draft_data: saved.draftData, published_data: saved.publishedData, seo_data: saved.seoData, updated_by: user.id, updated_at: timestamp, published_at: publish ? timestamp : null }, { onConflict: "content_key" });
    if (saveResult.error) throw saveResult.error;
    await recordAudit(user, publish ? "content.published" : "content.edited", saved.contentType, saved.contentKey, undefined, saved);
  } catch (error) {
    throw new Error(`Content could not be saved to Supabase: ${error instanceof Error ? error.message : "database error"}`);
  }
  return next;
}

export function getCachedAudit() {
  return readLocal<AuditEntry[]>(CMS_AUDIT_STORAGE_KEY, []);
}

export async function fetchAuditLogs() {
  const fallback = getCachedAudit();
  if (!remoteCmsEnabled) return fallback;
  if (remoteCmsEnabled) try {
    const { data, error } = await client.from("cms_audit_logs").select("*").order("created_at", { ascending: false }).limit(250);
    if (error) return fallback;
    return (data || []).map(row => ({ id: String(row.id), userEmail: String(row.user_email || ""), action: String(row.action), resourceType: String(row.resource_type), resourceId: String(row.resource_id || ""), result: String(row.result), createdAt: String(row.created_at), oldValue: row.old_value, newValue: row.new_value }));
  } catch {
    return fallback;
  }
}

export async function recordAudit(user: CmsAdminUser, action: string, resourceType: string, resourceId: string, oldValue?: unknown, newValue?: unknown, result = "success") {
  const entry: AuditEntry = { id: crypto.randomUUID(), userEmail: user.email, action, resourceType, resourceId, result, createdAt: new Date().toISOString(), oldValue, newValue };
  const local = [entry, ...getCachedAudit()].slice(0, 500);
  writeLocal(CMS_AUDIT_STORAGE_KEY, local);
  if (remoteCmsEnabled) try {
    await client.from("cms_audit_logs").insert({ user_id: user.id, user_email: user.email, action, resource_type: resourceType, resource_id: resourceId, old_value: oldValue || null, new_value: newValue || null, result, user_agent: navigator.userAgent });
  } catch {
    // Local development remains usable before migration setup.
  }
}

export async function getCmsAdminUser(authUser?: User | null): Promise<CmsAdminUser | null> {
  if (import.meta.env.DEV && localStorage.getItem("admin_authenticated") === "true") {
    const stored = readLocal<{ id?: string; email?: string; role?: CmsRole }>("admin_user", {});
    return { id: stored.id || "dev-user", email: stored.email || "admin@ambs.ae", role: stored.role || "super_admin", mfaRequired: false };
  }
  let user = authUser;
  if (!user) user = (await client.auth.getUser()).data.user;
  if (user) {
    try {
      const { data } = await client.from("cms_admin_profiles").select("role,mfa_required,email").eq("user_id", user.id).maybeSingle();
      if (data) return { id: user.id, email: String(data.email || user.email || ""), role: data.role as CmsRole, mfaRequired: Boolean(data.mfa_required) };
    } catch {
      // Development fallback below.
    }
    if (import.meta.env.DEV) return { id: user.id, email: user.email || "admin@ambs.ae", role: "admin", mfaRequired: false };
    return null;
  }
  return null;
}

export const roleLabels: Record<CmsRole, string> = {
  super_admin: "Super Admin", admin: "Admin", seo_reviewer: "SEO Reviewer", content_editor: "Content Editor", media_manager: "Media Manager", sales_marketing_draft: "Sales/Marketing Draft User",
};
export const canPublish = (role: CmsRole) => role === "super_admin" || role === "admin";
export const canManageMedia = (role: CmsRole) => ["super_admin", "admin", "media_manager"].includes(role);
export const canEditAlt = (role: CmsRole) => ["super_admin", "admin", "seo_reviewer", "media_manager"].includes(role);
export const canEditSeo = (role: CmsRole) => ["super_admin", "admin", "seo_reviewer"].includes(role);
export const canEditContent = (role: CmsRole) => ["super_admin", "admin", "seo_reviewer", "content_editor", "sales_marketing_draft"].includes(role);
export const canManageUsers = (role: CmsRole) => role === "super_admin";

export function exportToCsv(fileName: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map(row => headers.map(header => escape(row[header])).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportCurrentViewToPdf(title: string) {
  const original = document.title;
  document.title = `AMBS ${title}`;
  window.print();
  document.title = original;
}
