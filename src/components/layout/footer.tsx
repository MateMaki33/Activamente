import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";

export const Footer = () => (
  <footer className="mt-12 border-t border-indigo-200 bg-gradient-to-r from-indigo-900 to-sky-900 text-slate-100">
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-3">
      <div>
        <p className="font-bold text-white">Legal</p>
        <ul className="mt-2 space-y-1">
          <li><Link href="/legal/privacidad" className="font-medium underline decoration-sky-300 underline-offset-4">Privacidad</Link></li>
          <li><Link href="/legal/cookies" className="font-medium underline decoration-sky-300 underline-offset-4">Cookies</Link></li>
          <li><Link href="/legal/aviso-legal" className="font-medium underline decoration-sky-300 underline-offset-4">Aviso legal</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-bold text-white">Redes</p>
        <ul className="mt-2 space-y-1">
          <li><a href={SOCIAL_LINKS.instagram} className="font-medium underline decoration-sky-300 underline-offset-4">Instagram</a></li>
          <li><a href={SOCIAL_LINKS.tiktok} className="font-medium underline decoration-sky-300 underline-offset-4">TikTok</a></li>
          <li><a href={SOCIAL_LINKS.linkedin} className="font-medium underline decoration-sky-300 underline-offset-4">LinkedIn</a></li>
          <li><a href={SOCIAL_LINKS.blog} className="font-medium underline decoration-sky-300 underline-offset-4">Blog: diginurs3</a></li>
        </ul>
      </div>
      <div className="md:text-right">
        <p className="font-bold text-white">Creado por: Jose Luis Diaz Garcia</p>
      </div>
    </div>
  </footer>
);
