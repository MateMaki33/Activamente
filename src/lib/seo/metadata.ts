import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export const buildMetadata = (title: string, description: string, keywords: string[]): Metadata => ({
  title: `${title} | ${APP_NAME}`,
  description,
  keywords,
  openGraph: {
    title: `${title} | ${APP_NAME}`,
    description,
    type: "website",
    locale: "es_ES",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${APP_NAME}`,
    description,
  },
});

export const defaultMetadata = buildMetadata(APP_NAME, APP_DESCRIPTION, [
  "estimulación cognitiva",
  "juegos para mayores",
  "memoria",
  "atención",
]);
