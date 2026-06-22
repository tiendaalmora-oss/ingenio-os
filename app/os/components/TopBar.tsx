import React from "react";

interface TopBarProps {
  title: string;
}

const INTEGRACIONES_STATUS = [
  { label: "Meta", activo: true },
  { label: "Supabase", activo: true },
  { label: "Shopify", activo: false },
  { label: "n8n", activo: false },
];

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
      <h1 className="text-lg font-bold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Estado de integraciones clave */}
        <div className="hidden md:flex items-center gap-3">
          {INTEGRACIONES_STATUS.map((i) => (
            <div key={i.label} className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  i.activo ? "bg-green-400" : "bg-zinc-600"
                }`}
              />
              <span className={`text-xs ${i.activo ? "text-zinc-400" : "text-zinc-600"}`}>
                {i.label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-px h-5 bg-zinc-800" />

        <div className="text-xs text-zinc-500">
          <ClientDate />
        </div>

        <button className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
          <span className="text-sm">⚙️</span>
        </button>
      </div>
    </header>
  );
}

function ClientDate() {
  const [dateStr, setDateStr] = React.useState("");
  
  React.useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    );
  }, []);

  return <span>{dateStr}</span>;
}
