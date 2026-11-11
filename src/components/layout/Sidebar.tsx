"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: string;
  large?: boolean;
  danger?: boolean;
  badgeText?: string;
};

const mainMenus: DashboardMenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "/icons/dashboard.svg",
  },
  {
    label: "Modul Game",
    href: "/modules",
    icon: "/icons/tantangan.svg",
    large: true,
  },
  {
    label: "Katalog Template",
    href: "/templates",
    icon: "/icons/eksplorasi.svg",
  },
  {
    label: "Kurikulum SMA",
    href: "/kurikulum",
    icon: "/icons/belajar.svg",
    badgeText: "Segera Hadir",
  },
];

const accountMenus: DashboardMenuItem[] = [
  {
    label: "Pengaturan",
    href: "/pengaturan",
    icon: "/icons/pengaturan.svg",
  },
  {
    label: "Keluar Akun",
    href: "/login",
    icon: "/icons/keluar.svg",
    danger: true,
  },
];

function SidebarMenu({ item, pathname, onLogout }: { item: DashboardMenuItem; pathname: string; onLogout?: () => void }) {
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  const className = [
    "group flex h-12 w-full items-center justify-between gap-2 rounded-lg px-5",
    "whitespace-nowrap no-underline",
    "font-['Encode_Sans'] text-lg font-medium leading-7",
    "transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[#5295CD]",
    item.danger ? "text-[#F31260] hover:bg-[#FFF0F5]" : "text-[#71717A]",
    item.large ? "text-xl" : "",
    isActive ? "rounded-xl bg-[#2370AF] font-semibold text-white shadow-[0_3px_0_#205994]" : "",
    !isActive && !item.danger ? "hover:rounded-xl hover:bg-[#5295CD] hover:font-semibold hover:text-white hover:shadow-[0_3px_0_#205994]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (item.danger && onLogout) {
    return (
      <li>
        <button type="button" onClick={onLogout} className={`${className} cursor-pointer border-0 bg-transparent text-left`}>
          <span className="flex items-center gap-2.5">
            <img src={item.icon} alt="" aria-hidden="true" className="h-7 w-7 shrink-0" />
            <span>{item.label}</span>
          </span>
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link href={item.href} aria-current={isActive ? "page" : undefined} className={className}>
        <span className="flex min-w-0 items-center gap-2.5">
          <img src={item.icon} alt="" aria-hidden="true" className="h-7 w-7 shrink-0" />
          <span className="truncate">{item.label}</span>
        </span>

        {item.badgeText && (
          <span
            className={[
              "shrink-0 rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold leading-4",
              isActive ? "bg-white/20 text-white" : "bg-[#FFF7E6] text-[#B57E00] group-hover:bg-white/20 group-hover:text-white",
            ].join(" ")}
          >
            {item.badgeText}
          </span>
        )}
      </Link>
    </li>
  );
}

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="box-border fixed left-0 top-0 z-50 flex h-screen w-[306px] shrink-0 flex-col gap-8 border-r border-[#E8E8E8] bg-white p-8">
      {/* Logo */}
      <Link href="/dashboard" aria-label="Kabiru Dashboard - Beranda" className="inline-flex items-center gap-2 no-underline">
        <img src="/icons/logo.svg" alt="Kabiru Studio & CMS" className="block h-[42px] w-[140px] object-contain" />
      </Link>

      {/* Navigasi utama dan navigasi akun */}
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        <nav aria-label="Navigasi utama dashboard">
          <ul className="m-0 flex list-none flex-col gap-[14px] p-0">
            {mainMenus.map((item) => (
              <SidebarMenu key={item.href} item={item} pathname={pathname} />
            ))}
          </ul>
        </nav>

        <nav aria-label="Navigasi akun">
          <ul className="m-0 flex list-none flex-col gap-[14px] p-0">
            {accountMenus.map((item) => (
              <SidebarMenu key={item.href} item={item} pathname={pathname} onLogout={item.danger ? onLogout : undefined} />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
