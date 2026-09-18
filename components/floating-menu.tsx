"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, HelpCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Dragging states
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only allow drag with primary button (left click) or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    setIsDragging(true);
    hasMoved.current = false;
    
    // Calculate the offset between the pointer and the current position
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    // Set pointer capture to ensure we keep getting events even if the pointer leaves the element
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    
    // Prevent accidental toggles if moved just a tiny bit
    const dx = Math.abs(e.clientX - dragStartPos.current.x - position.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y - position.y);
    if (dx > 3 || dy > 3) {
      hasMoved.current = true;
    }
    
    // Calculate new position
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // If it hasn't moved much, treat as a click
    if (!hasMoved.current) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      className="fixed bottom-24 left-6 z-50 md:hidden" 
      ref={menuRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none' // Prevent scrolling when dragging
      }}
    >
      {/* Menu Items */}
      <div
        className={cn(
          "absolute bottom-16 left-0 flex flex-col gap-3 transition-all duration-300 ease-in-out",
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        <Link
          href="/pengaturan"
          className="flex items-center gap-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-3 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors group relative"
          aria-label="Settings"
        >
          <Settings size={22} />
          <span className="text-sm font-medium pl-2 opacity-0 group-hover:opacity-100 absolute left-14 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 pointer-events-none transition-opacity whitespace-nowrap">
            Pengaturan
          </span>
        </Link>
        
        <Link
          href="/bantuan"
          className="flex items-center gap-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-3 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors group relative"
          aria-label="Help"
        >
          <HelpCircle size={22} />
          <span className="text-sm font-medium pl-2 opacity-0 group-hover:opacity-100 absolute left-14 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 pointer-events-none transition-opacity whitespace-nowrap">
            Bantuan
          </span>
        </Link>
      </div>

      {/* Main Toggle Button */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors duration-300 select-none",
          isOpen ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "",
          isDragging ? "cursor-grabbing scale-105 opacity-90" : "cursor-grab active:scale-95"
        )}
        aria-label="Toggle menu"
      >
        <div className={cn("transition-transform duration-300", isOpen ? "rotate-90" : "rotate-0")}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </button>
    </div>
  );
}
