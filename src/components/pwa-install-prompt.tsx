// src/components/pwa-install-prompt.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend Window to include the non-standard beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

const DISMISSED_KEY = "odoj_pwa_prompt_dismissed";

/**
 * Detect if the app is already running as an installed PWA.
 * Checks both the standard display-mode media query and iOS-specific navigator.standalone.
 */
function isRunningAsPWA(): boolean {
    if (typeof window === "undefined") return false;

    // Standard: matches if display mode is standalone or fullscreen
    const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const displayModeFullscreen = window.matchMedia("(display-mode: fullscreen)").matches;

    // iOS Safari specific
    const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;

    return displayModeStandalone || displayModeFullscreen || iosStandalone;
}

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        // Don't show if already installed as PWA
        if (isRunningAsPWA()) return;

        // Don't show if user previously dismissed (permanent)
        const dismissed = localStorage.getItem(DISMISSED_KEY);
        if (dismissed) return;

        // Detect iOS (no native beforeinstallprompt support)
        const ua = navigator.userAgent;
        const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        setIsIOS(isIOSDevice);

        // For Android/Chrome: capture the beforeinstallprompt event
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault(); // Prevent the default mini-infobar
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // For iOS: show manual instructions since there's no native prompt API
        if (isIOSDevice) {
            setShowPrompt(true);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = useCallback(async () => {
        if (!deferredPrompt) return;

        setInstalling(true);
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
        }

        setDeferredPrompt(null);
        setInstalling(false);
    }, [deferredPrompt]);

    const handleDismiss = useCallback(() => {
        setShowPrompt(false);
        localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
                            <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Install ODOJ Tracker
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Akses lebih cepat dari layar utama
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                {isIOS ? (
                    // iOS: manual instructions
                    <div className="bg-emerald-50/50 rounded-lg p-3 text-xs text-emerald-800 space-y-1.5">
                        <p className="font-semibold">Cara install di iOS:</p>
                        <ol className="list-decimal list-inside space-y-1 text-emerald-700">
                            <li>
                                Tap tombol <span className="font-semibold">Share</span> (ikon kotak dengan panah ke atas)
                            </li>
                            <li>
                                Scroll ke bawah, tap <span className="font-semibold">&quot;Add to Home Screen&quot;</span>
                            </li>
                            <li>
                                Tap <span className="font-semibold">Add</span>
                            </li>
                        </ol>
                    </div>
                ) : (
                    // Android/Desktop: native install button
                    <Button
                        onClick={handleInstall}
                        disabled={installing || !deferredPrompt}
                        className="w-full h-10 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold shadow-md gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {installing ? "Menginstall..." : "Tambahkan ke Layar Utama"}
                    </Button>
                )}
            </div>
        </div>
    );
}
