import { getPublicSiteUrl } from "@/lib/canonical";

export const company = {
  legalName: "AM Building Solutions DWC LLC",
  brandName: "AM Building Solutions",
  shortName: "AMBS",
  email: "malheeh@ambs.ae",
  website: getPublicSiteUrl(),
  location: "Dubai, United Arab Emirates",
  whatsappNumber: String(import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  phoneNumber: String(import.meta.env.VITE_PHONE_NUMBER || "").trim(),
};

export function phoneUrl() {
  return company.phoneNumber ? `tel:${company.phoneNumber.replace(/[^+\d]/g, "")}` : "";
}

export function whatsappUrl(message: string) {
  return company.whatsappNumber
    ? `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(message)}`
    : "/contact";
}

