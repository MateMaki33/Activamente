import { SOCIAL_LINKS } from "@/lib/constants";
import Link from "next/link";

export const Footer = () => (
  <footer className="mt-12 border-t border-slate-200 bg-slate-50">
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-3">
      <div>
        <p className="font-semibold">Legal</p>
        <ul className="mt-2 space-y-1">
          <li><Link href="/legal/privacidad" className="underline">Privacidad</Link></li>
          <li><Link href="/legal/cookies" className="underline">Cookies</Link></li>
          <li><Link href="/legal/aviso-legal" className="underline">Aviso legal</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-semibold">Redes</p>
        <ul className="mt-2 space-y-1">
          <li><a href={SOCIAL_LINKS.instagram} className="underline">Instagram</a></li>
          <li><a href={SOCIAL_LINKS.tiktok} className="underline">TikTok</a></li>
          <li><a href={SOCIAL_LINKS.linkedin} className="underline">LinkedIn</a></li>
          <li><a href={SOCIAL_LINKS.blog} className="underline">Blog: NutruxIQ</a></li>
        </ul>
      </div>
      <div className="md:text-right">
        <p className="font-semibold">Creado por: Jose Luis Diaz Garcia</p>
      </div>
    </div>
  </footer>
);
