"use client";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm transition-all animate-in fade-in duration-300 px-4">
      <div className="relative group w-full max-w-[280px] sm:max-w-xs">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 sm:scale-150 animate-pulse" />

        <div className="relative bg-white p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            {/* Outer Ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="30 150"
                strokeLinecap="round"
                className="text-primary/20"
              />
            </svg>

            {/* Middle Ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_2s_linear_infinite_reverse]"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="80 140"
                strokeLinecap="round"
                className="text-primary/50"
              />
            </svg>

            {/* Inner Ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_1s_linear_infinite]"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="40 120"
                strokeLinecap="round"
                className="text-primary"
              />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm sm:text-base font-black tracking-[0.2em] text-slate-800 uppercase animate-pulse">
              กำลังโหลด
            </span>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
