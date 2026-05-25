"use client";

import React, { useState, useRef, useEffect } from "react";

export default function LandingBuilderPage() {
  const [code, setCode] = useState<string>('<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Mi Nueva Landing</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-zinc-900 text-white min-h-screen flex items-center justify-center">\n  <div class="text-center">\n    <h1 class="text-4xl font-bold text-cyan-400 mb-4">Canvas en Blanco</h1>\n    <p class="text-zinc-400">Pega aquí tu código HTML y previsualízalo en vivo.</p>\n  </div>\n</body>\n</html>');
  
  // Undo/Redo State
  const [history, setHistory] = useState<string[]>([code]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  const [slug, setSlug] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Save to history (debounce could be added for performance, but this is fine for now)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    
    // Keep max 50 states to prevent memory leaks
    if (newHistory.length > 50) newHistory.shift();
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCode(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCode(history[historyIndex + 1]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug.trim() !== "" ? slug.trim() : "manual_uploads");
    formData.append("folder", "images");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        // Automatically insert the img tag into the code at the end of body, or just copy to clipboard
        navigator.clipboard.writeText(data.url);
        setMessage({ type: 'success', text: `Imagen subida: ${data.url} (Copiada al portapapeles)` });
      } else {
        throw new Error(data.error || "Error al subir la imagen");
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePublish = async () => {
    if (!slug.trim()) {
      setMessage({ type: 'error', text: "Por favor define un Slug URL (ej: mi-oferta-1)" });
      return;
    }

    setIsPublishing(true);
    setMessage(null);

    try {
      const res = await fetch("/api/landing/manual-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), html: code })
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `¡Publicado exitosamente! URL: ${data.url}` });
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col text-white font-sans">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Volver
          </button>
          <div className="h-4 w-px bg-zinc-800"></div>
          <h1 className="font-bold">Editor Canvas HTML</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <span className="px-3 text-zinc-500 text-sm">/os/landing/</span>
            <input 
              type="text" 
              placeholder="tu-slug-aqui"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-none text-sm outline-none w-32 px-2 py-1.5 text-cyan-400 placeholder:text-zinc-600"
            />
          </div>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isPublishing ? 'Publicando...' : 'Publicar 🚀'}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between px-4 shrink-0">
        <div className="flex gap-2">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition-colors"
            title="Deshacer (Ctrl+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition-colors"
            title="Rehacer (Ctrl+Shift+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            {isUploading ? 'Subiendo...' : 'Subir Imagen y Copiar URL'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`px-6 py-2 text-sm text-center ${message.type === 'error' ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'}`}>
          {message.text}
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          <div className="bg-zinc-900/80 text-[10px] text-zinc-500 uppercase tracking-widest px-4 py-1.5 font-bold border-b border-zinc-800">
            HTML Source
          </div>
          <textarea 
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 flex flex-col bg-white relative">
          <div className="bg-zinc-900/80 text-[10px] text-zinc-500 uppercase tracking-widest px-4 py-1.5 font-bold border-b border-zinc-800 absolute top-0 left-0 w-full z-10 opacity-30 hover:opacity-100 transition-opacity">
            Live Preview
          </div>
          <iframe 
            srcDoc={code}
            title="Live Preview"
            className="flex-1 w-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
