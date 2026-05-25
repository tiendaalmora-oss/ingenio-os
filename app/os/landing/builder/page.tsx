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
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Image Gallery State
  const [showGallery, setShowGallery] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Load images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/upload?slug=${slug.trim() || 'manual_uploads'}`);
        const data = await res.json();
        if (data.success) {
          setUploadedImages(data.files);
        }
      } catch (err) {
        console.error("Failed to load images", err);
      }
    };
    if (showGallery) {
      fetchImages();
    }
  }, [showGallery, slug]);

  // Iframe Click-to-Edit Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ELEMENT_CLICKED' && event.data?.snippet) {
        const snippet = event.data.snippet;
        const textarea = textareaRef.current;
        if (!textarea) return;

        const val = textarea.value;
        const index = val.indexOf(snippet);
        
        if (index !== -1) {
          textarea.focus();
          textarea.setSelectionRange(index, index + snippet.length);
          
          // Scroll textarea to selection (approximate calculation)
          const lines = val.substring(0, index).split('\n');
          const lineHeight = 20; // px
          textarea.scrollTop = Math.max(0, (lines.length - 3) * lineHeight);
          
          setMessage({ type: 'success', text: `Elemento <${event.data.tagName}> seleccionado en el código.` });
          setTimeout(() => setMessage(null), 2000);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Save to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    
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
        navigator.clipboard.writeText(data.url);
        setUploadedImages(prev => [...prev, data.url]);
        setShowGallery(true);
        setMessage({ type: 'success', text: `Imagen subida y copiada al portapapeles` });
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

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setMessage({ type: 'success', text: `URL copiada: ${url}` });
    setTimeout(() => setMessage(null), 2000);
  };

  const handlePublish = async () => {
    if (!slug.trim()) {
      setMessage({ type: 'error', text: "Por favor define un Slug URL (ej: mi-oferta-1)" });
      return;
    }

    setIsPublishing(true);
    setMessage(null);
    setPublishedUrl(null);

    try {
      const res = await fetch("/api/landing/manual-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim(), html: code })
      });
      const data = await res.json();

      if (data.success) {
        setPublishedUrl(data.url);
        setMessage({ type: 'success', text: `¡Publicado exitosamente!` });
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsPublishing(false);
    }
  };

  // Iframe injection script to intercept clicks
  const iframeHtml = code + `
<script>
  document.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    let target = e.target;
    // Intentar no enviar html entero o body entero
    if (target.tagName.toLowerCase() === 'html' || target.tagName.toLowerCase() === 'body') return;

    // Extraer exactamente como se veria este tag pero sin su innerHTML si es muy largo
    // Para simplificar, cortamos en 150 caracteres para hacer match en el codigo fuente
    let clone = target.cloneNode(false);
    let snippet = clone.outerHTML.replace('></' + target.tagName.toLowerCase() + '>', '>');
    
    // Fallback por si la etiqueta se cierra en linea (img, input)
    if (snippet.length > 100) snippet = snippet.substring(0, 100);

    // Enviar mensaje al editor padre
    window.parent.postMessage({ 
      type: 'ELEMENT_CLICKED', 
      snippet: snippet,
      tagName: target.tagName.toLowerCase()
    }, "*");
  }, true);
</script>
`;

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
          <h1 className="font-bold flex items-center gap-2">
            Editor Canvas HTML
            {publishedUrl && (
              <a 
                href={publishedUrl} 
                target="_blank" 
                className="ml-4 bg-green-500/20 text-green-400 hover:bg-green-500/40 px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1 border border-green-500/50"
              >
                🌐 Ver en Vivo
              </a>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <span className="px-3 text-zinc-500 text-sm">/</span>
            <input 
              type="text" 
              placeholder="tu-slug"
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
            onClick={() => setShowGallery(!showGallery)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${showGallery ? 'bg-cyan-900 text-cyan-300' : 'text-zinc-400 hover:text-white'}`}
          >
            🖼️ Banco de Imágenes
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 border border-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            {isUploading ? 'Subiendo...' : 'Subir Nueva'}
          </button>
        </div>
      </div>

      {/* Image Gallery Panel */}
      {showGallery && (
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 shrink-0 overflow-x-auto">
          <div className="flex gap-4">
            {uploadedImages.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No hay imágenes en el banco. Sube una para comenzar.</p>
            ) : (
              uploadedImages.map((url, idx) => (
                <div 
                  key={idx} 
                  onClick={() => copyImageUrl(url)}
                  className="w-20 h-20 shrink-0 bg-zinc-950 border border-zinc-700 rounded overflow-hidden cursor-pointer group relative"
                  title="Clic para copiar URL"
                >
                  <img src={url} alt="Uploaded" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold">COPIAR</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {message && (
        <div className={`px-6 py-2 text-sm text-center ${message.type === 'error' ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'}`}>
          {message.text}
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col relative group">
          <div className="absolute top-0 right-0 bg-zinc-900/80 text-[10px] text-zinc-500 uppercase tracking-widest px-4 py-1.5 font-bold border-b border-l border-zinc-800 z-10 rounded-bl-lg">
            HTML Source
          </div>
          <textarea 
            ref={textareaRef}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 outline-none resize-none pt-10"
            spellCheck={false}
          />
        </div>

        {/* Right: Live Preview */}
        <div className="w-1/2 flex flex-col bg-white relative">
          <div className="bg-zinc-900/80 text-[10px] text-zinc-500 uppercase tracking-widest px-4 py-1.5 font-bold border-b border-zinc-800 absolute top-0 left-0 w-full z-10 opacity-30 hover:opacity-100 transition-opacity flex justify-between pointer-events-none">
            <span>Live Preview</span>
            <span className="text-cyan-400">⚡ Click-to-Edit Activado</span>
          </div>
          <iframe 
            srcDoc={iframeHtml}
            title="Live Preview"
            className="flex-1 w-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
