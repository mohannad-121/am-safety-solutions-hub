export const company = {
  legalName: "AM Building Solutions DWC LLC",
  brandName: "AM Building Solutions",
  shortName: "AMBS",
  email: "malheeh@ambs.ae",
  website: "https://www.ambs.ae",
  location: "Dubai, United Arab Emirates",
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER || "971558556746").replace(/\D/g, ""),
  phoneNumber: (import.meta.env.VITE_PHONE_NUMBER || "+971 55 855 6746").trim(),
};

export function phoneUrl() {
  return company.phoneNumber ? `tel:${company.phoneNumber.replace(/[^+\d]/g, "")}` : "";
}

export function whatsappUrl(message: string) {
  const base = company.whatsappNumber
    ? `https://wa.me/${company.whatsappNumber}`
    : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
