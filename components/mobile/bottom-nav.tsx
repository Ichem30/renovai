"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/app", icon: PlusSquare, label: "Nouveau" },
    { href: "/profile", icon: User, label: "Profil" },
    { href: "/settings", icon: Settings, label: "Réglages" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 pb-safe backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                isActive ? "text-purple-500" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
