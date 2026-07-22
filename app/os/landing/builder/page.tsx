"use client";

import React, { useState, useRef, useEffect } from "react";

export default function LandingBuilderPage() {
  const [code, setCode] = useState<string>('<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Mi Nueva Landing</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-zinc-900 text-white min-h-screen flex items-center justify-center">\n  <div class="text-center">\n    <h1 class="text-4xl font-bold text-cyan-400 mb-4">Canvas en Blanco</h1>\n    <p class="text-zinc-400">Pega aquí tu código HTML y previsualízalo en vivo.</p>\n  </div>\n</body>\n</html>');
  
  // Undo/Redo State
  const [history, setHistory] = useState<string[]>([code]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Load existing HTML from slug if present
  const [variantId, setVariantId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Cargar proyectos disponibles para el dropdown
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (data.success) setProducts(data.products || []);
      })
      .catch(err => console.error("Error loading products:", err));

    const params = new URLSearchParams(window.location.search);
    const urlSlug = params.get("slug");
    const vId = params.get("variantId");

    let fetchUrl = "";
    if (vId) {
      setVariantId(vId);
      fetchUrl = `/api/landing/manual-publish?variantId=${vId}`;
    } else if (urlSlug) {
      fetchUrl = `/api/landing/manual-publish?slug=${urlSlug}`;
    }

    if (fetchUrl) {
      fetch(fetchUrl)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.html) {
            setCode(data.html);
            setHistory([data.html]);
            setHistoryIndex(0);
            if (data.slug) setSlug(data.slug);
          }
        })
        .catch(err => console.error("Error loading HTML:", err));
    }
  }, []);
  
  const [slug, setSlug] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Media Bank State
  const [activeBank, setActiveBank] = useState<'images' | 'videos' | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  // Poster state: maps videoUrl -> selected posterUrl
  const [videoPoster, setVideoPoster] = useState<Record<string, string>>({});
  // When this is set, clicking an image assigns it as poster for this videoUrl
  const [selectingPosterFor, setSelectingPosterFor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
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

  // Load images when image bank opens
  useEffect(() => {
    if (activeBank === 'images') {
      const fetchImages = async () => {
        try {
          const res = await fetch(`/api/upload?slug=${slug.trim() || 'manual_uploads'}&folder=images`);
          const data = await res.json();
          if (data.success) setUploadedImages(data.files);
        } catch (err) {
          console.error("Failed to load images", err);
        }
      };
      fetchImages();
    }
  }, [activeBank, slug]);

  // Load videos when video bank opens
  useEffect(() => {
    if (activeBank === 'videos') {
      const fetchVideos = async () => {
        try {
          const res = await fetch(`/api/upload?slug=${slug.trim() || 'manual_uploads'}&folder=videos`);
          const data = await res.json();
          if (data.success) setUploadedVideos(data.files);
        } catch (err) {
          console.error("Failed to load videos", err);
        }
      };
      fetchVideos();
    }
  }, [activeBank, slug]);

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
          const lines = val.substring(0, index).split('\n');
          const lineHeight = 20;
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

    // Validación de tamaño en el cliente (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen supera el límite de 50 MB.' });
      return;
    }

    setIsUploading(true);
    setMessage({ type: 'success', text: `Preparando carga segura a la nube para "${file.name}"...` });

    try {
      // 1. Pedir URL firmada de Supabase
      const presignRes = await fetch("/api/images/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          slug: slug.trim() !== "" ? slug.trim() : "manual_uploads",
        }),
      });
      const presignData = await presignRes.json();

      if (!presignData.success) {
        throw new Error(presignData.error || "Error al obtener URL de carga segura");
      }

      // 2. Subir directamente a Supabase Storage (bypasea límites de Next.js/Easypanel)
      const uploadRes = await fetch(presignData.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("La subida a la nube falló. Verifica tu conexión a internet.");
      }

      // 3. Usar la URL pública de Supabase (persistente, no depende del servidor)
      const publicUrl = presignData.publicUrl;
      navigator.clipboard.writeText(publicUrl);
      setUploadedImages(prev => [...prev, publicUrl]);
      setActiveBank('images');
      setMessage({ type: 'success', text: `✅ Imagen subida a la nube y URL copiada al portapapeles` });

      // 4. Confirmar subida: reemplaza URLs viejas en todas las landings del slug automáticamente
      fetch("/api/images/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalFilename: file.name,
          publicUrl: publicUrl,
          slug: slug.trim() !== "" ? slug.trim() : "manual_uploads",
        }),
      }).then(r => r.json()).then(d => {
        if (d.updatedVariants > 0) {
          setMessage({ type: 'success', text: `✅ Imagen subida. ${d.updatedVariants} landing(s) actualizadas automáticamente.` });
        }
      }).catch(() => {});

      setTimeout(() => setMessage(null), 5000);
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño en el cliente (1 GB)
    if (file.size > 1024 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El video supera el límite de 1 GB.' });
      return;
    }

    setIsUploadingVideo(true);
    setMessage({ type: 'success', text: `Preparando carga segura a la nube para "${file.name}"...` });

    try {
      // 1. Pedir URL firmada de Supabase
      const presignRes = await fetch("/api/videos/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      const presignData = await presignRes.json();

      if (!presignData.success) {
        throw new Error(presignData.error || "Error al obtener URL de carga segura");
      }

      setMessage({ type: 'success', text: `Subiendo "${file.name}" directamente a la nube (0%)... esto puede tardar unos minutos dependiendo de tu internet.` });

      // 2. Subir directamente a Supabase Storage (Bypassea Next.js y Vercel/Easypanel limits!)
      const uploadRes = await fetch(presignData.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error("La subida a la nube falló. Verifica tu conexión a internet.");
      }

      // 3. Obtener la URL pública final
      setUploadedVideos(prev => [...prev, presignData.publicUrl]);
      setActiveBank('videos');
      setMessage({ type: 'success', text: `¡Video "${file.name}" subido exitosamente a la nube!` });
      setTimeout(() => setMessage(null), 4000);

    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Inserta el snippet de video HTML5 optimizado en el código
  const insertVideoSnippet = (videoUrl: string) => {
    const videoName = videoUrl.split('/').pop() || 'video';
    const posterUrl = videoPoster[videoUrl] || '';
    const posterLine = posterUrl ? `\n    poster="${posterUrl}"` : '';
    const posterComment = posterUrl ? '' : '\n    <!-- TIP: Agregá poster="URL-imagen" para mostrar una portada antes de que el usuario presione play -->';

    const snippet = `\n<!-- VIDEO: ${videoName} — Carga solo cuando el usuario llega a esta sección -->
<div style="position:relative; width:100%; padding-bottom:56.25%; height:0; overflow:hidden; background:#000; border-radius:8px;">
  <video
    style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;"
    src="${videoUrl}"${posterLine}
    controls
    preload="none"
    playsinline
    muted
    loop${posterComment}
  >
    Tu navegador no soporta video HTML5.
  </video>
</div>\n`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + snippet + code.substring(end);
      handleCodeChange(newCode);
      const posterMsg = posterUrl ? ` con portada: ${posterUrl.split('/').pop()}` : ' (sin portada — usá el botón 📸 para asignar una)';
      setMessage({ type: 'success', text: `✅ Video insertado${posterMsg}` });
      setTimeout(() => setMessage(null), 6000);
    }
    setActiveBank(null);
    setSelectingPosterFor(null);
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
        body: JSON.stringify({ slug: slug.trim(), html: code, variantId: variantId })
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
    if (target.tagName.toLowerCase() === 'html' || target.tagName.toLowerCase() === 'body') return;

    let clone = target.cloneNode(false);
    let snippet = clone.outerHTML.replace('></' + target.tagName.toLowerCase() + '>', '>');
    
    if (snippet.length > 100) snippet = snippet.substring(0, 100);

    window.parent.postMessage({ 
      type: 'ELEMENT_CLICKED', 
      snippet: snippet,
      tagName: target.tagName.toLowerCase()
    }, "*");
  }, true);
</script>
`;

  // Archivo de video activo (para mostrar preview en hover)
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

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
              list="products-list"
              type="text" 
              placeholder="tu-slug"
              value={slug}
              disabled={!!variantId}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-none text-sm outline-none w-32 px-2 py-1.5 text-cyan-400 placeholder:text-zinc-600 disabled:opacity-50"
            />
            <datalist id="products-list">
              {products.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
            </datalist>
          </div>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isPublishing ? 'Guardando...' : 'Guardar y Publicar 🚀'}
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

        <div className="flex items-center gap-2">
          {/* Hidden file inputs */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <input 
            type="file" 
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            ref={videoInputRef}
            onChange={handleVideoUpload}
            className="hidden"
          />

          {/* Banco de Imágenes */}
          <button 
            onClick={() => setActiveBank(activeBank === 'images' ? null : 'images')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${activeBank === 'images' ? 'bg-cyan-900 text-cyan-300' : 'text-zinc-400 hover:text-white'}`}
          >
            🖼️ Imágenes
          </button>

          {/* Banco de Videos */}
          <button 
            onClick={() => setActiveBank(activeBank === 'videos' ? null : 'videos')}
            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${activeBank === 'videos' ? 'bg-violet-900 text-violet-300' : 'text-zinc-400 hover:text-white'}`}
          >
            🎬 Videos
          </button>

          {/* Divisor */}
          <div className="w-px h-5 bg-zinc-700 mx-1"></div>

          {/* Subir Imagen */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 border border-zinc-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            {isUploading ? 'Subiendo...' : 'Img'}
          </button>

          {/* Subir Video */}
          <button 
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploadingVideo}
            className="flex items-center gap-1.5 text-xs font-medium text-violet-300 bg-violet-950/60 hover:bg-violet-900/60 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 border border-violet-800/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
            {isUploadingVideo ? 'Subiendo...' : 'Video'}
          </button>
        </div>
      </div>

      {/* ── Banco de IMÁGENES ─────────────────────────────────────────────────── */}
      {activeBank === 'images' && (
        <div className={`border-b p-4 shrink-0 overflow-x-auto transition-colors ${
          selectingPosterFor
            ? 'bg-amber-950/40 border-amber-700/50'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className="flex gap-4 items-center">
            {/* Label contextual: modo normal vs modo selección de poster */}
            <div className="shrink-0 flex flex-col gap-0.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                selectingPosterFor ? 'text-amber-400' : 'text-zinc-500'
              }`}>
                {selectingPosterFor ? '📸 Elegí portada' : 'Imágenes'}
              </span>
              {selectingPosterFor && (
                <button
                  onClick={() => setSelectingPosterFor(null)}
                  className="text-[9px] text-amber-600 hover:text-amber-400 underline text-left"
                >
                  cancelar
                </button>
              )}
            </div>

            {uploadedImages.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No hay imágenes. Sube una con el botón "Img".</p>
            ) : (
              uploadedImages.map((url, idx) => {
                const isSelectedPoster = videoPoster[selectingPosterFor ?? ''] === url;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (selectingPosterFor) {
                        // Modo selección de poster: asignar imagen al video
                        setVideoPoster(prev => ({ ...prev, [selectingPosterFor]: url }));
                        setSelectingPosterFor(null);
                        setMessage({ type: 'success', text: `✅ Portada asignada. Ahora hacé clic en "+ Insertar en HTML" en el video.` });
                        setTimeout(() => setMessage(null), 4000);
                      } else {
                        copyImageUrl(url);
                      }
                    }}
                    className={`w-20 h-20 shrink-0 bg-zinc-950 rounded overflow-hidden cursor-pointer group relative transition-all ${
                      isSelectedPoster
                        ? 'border-2 border-amber-400 ring-2 ring-amber-400/30'
                        : selectingPosterFor
                        ? 'border border-amber-700/50 hover:border-amber-400'
                        : 'border border-zinc-700'
                    }`}
                    title={selectingPosterFor ? 'Usar como portada del video' : 'Clic para copiar URL'}
                  >
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold">{selectingPosterFor ? 'PORTADA' : 'COPIAR'}</span>
                    </div>
                    {isSelectedPoster && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-black font-black">✓</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Banco de VIDEOS ──────────────────────────────────────────────────── */}
      {activeBank === 'videos' && (
        <div className="bg-zinc-900/80 border-b border-violet-900/30 p-4 shrink-0 overflow-x-auto">
          <div className="flex gap-4 items-center">
            <span className="text-xs text-violet-400 shrink-0 font-bold uppercase tracking-wider">Videos</span>
            {uploadedVideos.length === 0 ? (
              <p className="text-zinc-500 text-sm italic">No hay videos. Sube uno con el botón "Video". (mp4, webm, mov — máx 200 MB)</p>
            ) : (
              uploadedVideos.map((url, idx) => {
                const name = url.split('/').pop() || 'video';
                return (
                  <div key={idx} className="shrink-0 flex flex-col items-center gap-1.5">
                    {/* Preview del video */}
                    <div
                      className="w-28 h-20 bg-zinc-950 border border-violet-800/50 rounded overflow-hidden cursor-pointer group relative"
                      onMouseEnter={() => setHoveredVideo(url)}
                      onMouseLeave={() => setHoveredVideo(null)}
                    >
                      <video
                        src={url}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        preload="metadata"
                        muted
                        playsInline
                        ref={el => {
                          if (el) {
                            if (hoveredVideo === url) {
                              el.play().catch(() => {});
                            } else {
                              el.pause();
                              el.currentTime = 0;
                            }
                          }
                        }}
                      />
                      {/* Icono play cuando no se hovea */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center group-hover:opacity-0 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      </div>
                    </div>

                    {/* Nombre, poster asignado y botones */}
                    <span className="text-[9px] text-zinc-500 max-w-[112px] truncate" title={name}>{name}</span>

                    {/* Indicador de poster asignado */}
                    {videoPoster[url] && (
                      <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-700/40 rounded px-1.5 py-0.5 max-w-[112px]">
                        <img src={videoPoster[url]} alt="poster" className="w-4 h-4 object-cover rounded-sm shrink-0" />
                        <span className="text-[8px] text-amber-400 truncate">{videoPoster[url].split('/').pop()}</span>
                        <button
                          onClick={() => setVideoPoster(prev => { const n = {...prev}; delete n[url]; return n; })}
                          className="text-amber-600 hover:text-red-400 shrink-0 ml-0.5"
                          title="Quitar portada"
                        >×</button>
                      </div>
                    )}

                    <div className="flex gap-1">
                      {/* Botón asignar poster */}
                      <button
                        onClick={() => {
                          setSelectingPosterFor(url);
                          setActiveBank('images');
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors border ${
                          videoPoster[url]
                            ? 'bg-amber-900/40 border-amber-700/50 text-amber-400 hover:bg-amber-800/50'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-700/50'
                        }`}
                        title="Asignar imagen de portada"
                      >
                        📸
                      </button>
                      {/* Botón insertar */}
                      <button
                        onClick={() => insertVideoSnippet(url)}
                        className="text-[10px] font-bold bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1 rounded transition-colors"
                      >
                        + Insertar
                      </button>
                    </div>
                  </div>
                );
              })
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
