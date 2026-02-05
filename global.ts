//* Libraries imports
import type { formats } from "@/i18n/request";
//* Local imports
import type { Locale } from "@/lib/locale";
import type messages from "./messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
