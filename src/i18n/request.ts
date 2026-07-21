//* Libraries imports

import { cookies, headers } from "next/headers";
import type { Formats } from "next-intl";
import { getRequestConfig } from "next-intl/server";

//* Local imports
import { type Locale, locales } from "@/lib/locale";

export const formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "2-digit",
      year: "2-digit",
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 2,
    },
  },
} satisfies Formats;

const defaultLocale: Locale = "en" as const;

function isCookieLocaleValid(cookieLocale: string | undefined): Locale | false {
  if (cookieLocale === null) return false;
  if (cookieLocale === undefined) return false;
  console.log("[request.ts] is cookieLocale valid", cookieLocale);

  const locale = cookieLocale.split(",")[0].toLocaleLowerCase() as Locale;
  const isValid = locales.includes(locale);

  return isValid ? locale : false;
}

function isHeaderLocaleValid(headerLocale: string | null): Locale | false {
  if (headerLocale === null) return false;
  if (headerLocale === undefined) return false;
  console.log("[request.ts] is headerLocale valid", headerLocale);

  const locale = headerLocale.split(",")[0].toLocaleLowerCase() as Locale;
  const isValid = locales.includes(locale);

  return isValid ? locale : false;
}

function getLocaleFromCookieOrHeader(
  cookieLocale: string | undefined,
  headerLocale: string | null,
): Locale {
  let locale: Locale = defaultLocale;

  const cookieLocaleValid = isCookieLocaleValid(cookieLocale);
  const headerLocaleValid = isHeaderLocaleValid(headerLocale);

  if (cookieLocaleValid) {
    locale = cookieLocaleValid;
  } else if (headerLocaleValid) {
    locale = headerLocaleValid;
  }

  console.log("[request.ts] locale determined from cookie or header", locale);

  return locale;
}

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.

  // check if theres a cookie with the name "NEXT_LOCALE"
  // if so, use that value as the locale
  // if not, check if the request has a header "accept-language"
  // if so, use that value as the locale
  // if not, use the default locale "en"

  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const headerLocale = (await headers()).get("accept-language");

  const locale: Locale = getLocaleFromCookieOrHeader(
    cookieLocale,
    headerLocale,
  );

  console.log("[request.ts] final locale determined", locale);

  console.log("[request.ts] final config", {
    locale,
    formats,
    messages: (await import(`../../messages/${locale}.json`)).default,
  });

  return {
    locale,
    formats,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
