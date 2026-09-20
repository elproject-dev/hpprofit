"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ColorScheme = "zinc" | "rose" | "blue" | "emerald" | "orange" | "custom";
type FontFamily = "poppins" | "outfit" | "nunito";
type FontSize = "sm" | "md" | "lg";

interface ThemeCustomizerContextType {
  colorScheme: ColorScheme;
  setColorScheme: (color: ColorScheme) => void;
  fontFamily: FontFamily;
  setFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  customH: number;
  setCustomH: (h: number) => void;
  customS: number;
  setCustomS: (s: number) => void;
  customL: number;
  setCustomL: (l: number) => void;
}

const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | undefined>(undefined);

export function ThemeCustomizerProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("emerald");
  const [fontFamily, setFontFamily] = useState<FontFamily>("outfit");
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [customH, setCustomH] = useState(142);
  const [customS, setCustomS] = useState(71);
  const [customL, setCustomL] = useState(45);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage
    const storedColor = localStorage.getItem("theme-color") as ColorScheme;
    const storedFont = localStorage.getItem("theme-font") as FontFamily;
    const storedSize = localStorage.getItem("theme-size") as FontSize;
    
    if (storedColor) setColorScheme(storedColor);
    if (storedFont) setFontFamily(storedFont);
    if (storedSize) {
      setFontSize(storedSize);
    } else {
      if (window.innerWidth < 768) {
        setFontSize("sm");
      }
    }

    const storedH = localStorage.getItem("theme-custom-h");
    const storedS = localStorage.getItem("theme-custom-s");
    const storedL = localStorage.getItem("theme-custom-l");
    if (storedH) setCustomH(Number(storedH));
    if (storedS) setCustomS(Number(storedS));
    if (storedL) setCustomL(Number(storedL));
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply color scheme
    const root = document.documentElement;
    
    // Remove old themes
    root.classList.remove("theme-zinc", "theme-rose", "theme-blue", "theme-emerald", "theme-orange", "theme-custom");
    root.classList.add(`theme-${colorScheme}`);
    localStorage.setItem("theme-color", colorScheme);
    
    // Manage dynamic HSL styles for custom theme
    if (colorScheme === "custom") {
      root.style.setProperty("--primary", `hsl(${customH}, ${customS}%, ${customL}%)`);
      root.style.setProperty("--ring", `hsl(${customH}, ${customS}%, ${customL}%)`);
    } else {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
    }

    // Apply font
    root.classList.remove("font-poppins", "font-outfit", "font-nunito");
    root.classList.add(`font-${fontFamily}`);
    localStorage.setItem("theme-font", fontFamily);
    
    // Apply font size
    root.classList.remove("font-size-sm", "font-size-md", "font-size-lg");
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem("theme-size", fontSize);
    
  }, [colorScheme, fontFamily, fontSize, customH, customS, customL, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme-custom-h", customH.toString());
    localStorage.setItem("theme-custom-s", customS.toString());
    localStorage.setItem("theme-custom-l", customL.toString());
  }, [customH, customS, customL, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeCustomizerContext.Provider value={{ 
      colorScheme, setColorScheme, 
      fontFamily, setFontFamily, 
      fontSize, setFontSize,
      customH, setCustomH,
      customS, setCustomS,
      customL, setCustomL
    }}>
      {children}
    </ThemeCustomizerContext.Provider>
  );
}

export function useThemeCustomizer() {
  const context = useContext(ThemeCustomizerContext);
  if (context === undefined) {
    throw new Error("useThemeCustomizer must be used within a ThemeCustomizerProvider");
  }
  return context;
}
