"use client";

import Image from "next/image";
import { Encode_Sans, Roboto_Condensed } from "next/font/google";
import { ChevronDown, Code2, Layers } from "lucide-react";

const encodeSans = Encode_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

export interface TopBarUserProps {
  name?: string;
  role?: "teacher" | "developer" | "admin";
  templateCount?: number;
}

const ROLE_LABELS: Record<NonNullable<TopBarUserProps["role"]>, string> = {
  teacher: "Guru (Template Author)",
  developer: "Developer Modul",
  admin: "Admin LMS",
};

export default function TopBar({
  name = "Achmad Soewardi",
  role = "developer",
  templateCount = 8,
}: TopBarUserProps) {
  return (
    <header className={`${encodeSans.className} flex h-[72px] w-full items-center justify-between gap-5 border-b border-[#e8e8e8] bg-white px-[28px] py-4`}>
      {/* Status Workspace Kiri */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#277BC0]/30 bg-[#E9F2F9] px-3 py-1 font-sans text-xs font-semibold text-[#277BC0]">
          <Code2 size={14} strokeWidth={2} aria-hidden="true" />
          <span>Game Module Studio</span>
        </span>
      </div>

      {/* Indikator & Profil Kanan */}
      <div className="flex items-center gap-5">
        {/* Jumlah Katalog Template Aktif */}
        <div className={`${robotoCondensed.className} flex shrink-0 items-center gap-1.5 text-xl font-extrabold leading-5 text-[#3674b5]`}>
          <Layers size={20} className="text-[#277BC0]" aria-hidden="true" />
          <span className="bg-[linear-gradient(157.48deg,#6adcfc_16.738%,#5b71e0_59.657%,#8f5ed7_83.158%)] bg-clip-text text-transparent">
            TEMPLATE
          </span>
          <span>{templateCount}</span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px shrink-0 bg-[rgba(17,17,17,0.15)]" role="separator" aria-orientation="vertical" />

        {/* Profile */}
        <button
          type="button"
          aria-haspopup="menu"
          className="flex shrink-0 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-right focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5295cd]"
        >
          {/* Nama dan role */}
          <span className="flex flex-col items-end justify-center">
            <span className="whitespace-nowrap text-base font-semibold leading-6 text-[#11181c]">{name}</span>

            <span className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold leading-4 text-[#f5a524]">
              <Image src="/icons/paw.svg" alt="" width={16} height={16} aria-hidden="true" />
              {ROLE_LABELS[role]}
            </span>
          </span>

          {/* Avatar dan chevron */}
          <span className="flex items-center gap-2">
            <Image src="/icons/avatar.svg" alt="Avatar pengguna" width={40} height={40} className="block rounded-full bg-[#d4d4d8] object-cover" />
            <ChevronDown size={18} strokeWidth={2} className="text-[#11181c]" aria-hidden="true" />
          </span>
        </button>
      </div>
    </header>
  );
}
