// src/components/bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

const STUDENT_NAV: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: "🏠" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/profile", label: "Profil", icon: "👤" },
];

const ADMIN_NAV: NavItem[] = [
    { href: "/admin", label: "Home", icon: "🏠" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/admin/students", label: "Siswa", icon: "👥" },
    { href: "/admin/logout", label: "Keluar", icon: "🚪" },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
    return (
        <Link
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${isActive
                    ? "text-emerald-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
        >
            <span className={`text-xl ${isActive ? "scale-110" : ""} transition-transform`}>
                {item.icon}
            </span>
            <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {item.label}
            </span>
            {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
            )}
        </Link>
    );
}

export function StudentBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
            <div className="max-w-2xl mx-auto flex items-center justify-around px-2">
                {STUDENT_NAV.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                    />
                ))}
            </div>
        </nav>
    );
}

export function AdminBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
            <div className="max-w-4xl mx-auto flex items-center justify-around px-2">
                {ADMIN_NAV.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        isActive={
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.href)
                        }
                    />
                ))}
            </div>
        </nav>
    );
}
