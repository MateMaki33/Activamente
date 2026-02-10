import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { defaultMetadata } from "@/lib/seo/metadata";
import { SettingsProvider } from "@/components/layout/settings-provider";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="text-slate-900">
        <SettingsProvider>
          <Header />
          <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-4 py-8">{children}</main>
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
