import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Flag } from 'lucide-react';

/**
 * Discoverable ⋯ menu with Report for another user's Studio video.
 * Does not render for the current user's own content (caller should gate that).
 */
export default function VideoSafetyMenu({
  onReport,
  variant = 'dark', // 'dark' for Studio overlay, 'light' for product page
  menuPlacement = 'up' // 'up' above trigger (Studio rail), 'down' below (headers)
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const isDark = variant === 'dark';

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={
          isDark
            ? 'flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform'
            : 'p-2 rounded-full hover:bg-slate-100 text-slate-500'
        }
      >
        {isDark ? (
          <>
            <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
              <MoreVertical className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">More</span>
          </>
        ) : (
          <MoreVertical className="w-5 h-5" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 w-44 rounded-2xl shadow-2xl overflow-hidden z-50 border ${
            menuPlacement === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'
          } ${
            isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800'
          }`}
        >
          <button
            type="button"
            role="menuitem"
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left text-[13px] font-semibold min-h-[44px] ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onReport?.();
            }}
          >
            <Flag className="w-4 h-4 shrink-0" />
            Report
          </button>
        </div>
      )}
    </div>
  );
}
