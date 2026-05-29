export const locales = ["en", "pt-br"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en" as const;

export const localeFlags: Record<Locale, string> = {
  en: "/flags/us.svg", // 🇺🇸
  "pt-br": "/flags/br.svg", // 🇧🇷
};

export const fixLocale: Record<Locale, string> = {
  en: "EN",
  "pt-br": "PT",
};
