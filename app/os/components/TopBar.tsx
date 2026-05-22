import React from "react";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-zinc-400">
          {new Date().toLocaleDateString("es-AR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
          <span className="text-sm">⚙️</span>
        </button>
      </div>
    </header>
  );
}
