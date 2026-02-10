import Link from "next/link";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

export const Header = () => (
  <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <Link href="/" className="text-2xl font-bold text-sky-800">
        {APP_NAME}
      </Link>
      <nav aria-label="Navegación principal">
        <ul className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link className="rounded-lg border border-slate-300 px-4 py-2 text-base font-semibold hover:bg-slate-100" href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
);
