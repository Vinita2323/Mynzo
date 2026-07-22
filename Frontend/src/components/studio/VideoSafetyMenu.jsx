import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Flag } from 'lucide-react';

/**
 * Discoverable ⋯ menu with Report for another user's Studio video.
 */
export default function VideoSafetyMenu({
  onReport,
  variant = 'dark',
  menuPlacement = 'up'
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

  const menuPositionClass = isDark
    ? // Studio rail: sit to the left of More, vertically centered on the icon
      'right-full top-0 mr-3'
    : menuPlacement === 'down'
      ? 'left-0 top-full mt-2'
      : 'left-0 bottom-full mb-2';

  return (
    <div className="relative z-30" ref={menuRef}>
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
          className={`absolute ${menuPositionClass} w-max min-w-[7.5rem] rounded-2xl shadow-2xl overflow-hidden z-[60] border ${
            isDark ? 'bg-slate-900/95 backdrop-blur-md border-white/15 text-white' : 'bg-white border-slate-100 text-slate-800'
          }`}
        >
          <button
            type="button"
            role="menuitem"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-left text-[13px] font-semibold whitespace-nowrap min-h-[44px] ${
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
