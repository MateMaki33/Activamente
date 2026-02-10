import Link from "next/link";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

export const Header = () => (
  <header className="border-b border-sky-200 bg-gradient-to-r from-sky-100 via-indigo-100 to-fuchsia-100">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <Link href="/" className="rounded-lg px-2 text-3xl font-extrabold text-sky-950">
        {APP_NAME}
      </Link>
      <nav aria-label="Navegación principal">
        <ul className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-base font-bold text-sky-900 shadow-sm transition hover:bg-sky-50"
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
);
