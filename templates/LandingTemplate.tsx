/**
 * Ingenio OS — Landing Template
 *
 * Base template for generating new SaaS landing pages.
 * Used by AI generation and manual project creation.
 *
 * Usage:
 *   import { LandingTemplate } from "@/templates/LandingTemplate";
 */

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface LandingTemplateProps {
  name: string;
  tagline: string;
  description: string;
  color: string;
  features: Feature[];
  demoPath: string;
  manualPath: string;
}

export function LandingTemplate({
  name,
  tagline,
  description,
  color,
  features,
  demoPath,
  manualPath,
}: LandingTemplateProps) {
  const colorStyle = { color } as React.CSSProperties;
  const borderStyle = { borderColor: `${color}66` } as React.CSSProperties;
  const bgStyle = { backgroundColor: color } as React.CSSProperties;

  return (
    <main className="bg-black text-white min-h-screen">
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <span
          className="inline-block mb-6 px-4 py-1 rounded-full border text-sm font-semibold tracking-widest uppercase"
          style={{ ...colorStyle, ...borderStyle }}
        >
          {tagline}
        </span>
        <h1 className="text-6xl font-bold mb-6 leading-tight" style={colorStyle}>
          {name}
        </h1>
        <p className="text-2xl max-w-3xl text-zinc-300 mb-10">{description}</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <a
            href={demoPath}
            className="font-bold text-xl px-10 py-5 rounded-2xl transition-all text-black"
            style={bgStyle}
          >
            Ver Demo
          </a>
          <a
            href={manualPath}
            className="border font-bold text-xl px-10 py-5 rounded-2xl transition-all"
            style={{ ...colorStyle, ...borderStyle }}
          >
            Ver Manual
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 px-10 pb-20 max-w-6xl mx-auto">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl transition-all"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
            <p className="text-zinc-400">{f.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
