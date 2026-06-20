"use client";

import React, { useEffect, useRef } from "react";
import { VolumeX, ChevronDown, Zap, ShieldAlert, BookOpenCheck, WifiOff, MessageCircle } from "lucide-react";

export default function VideoFerreosLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const unmuteWrapperRef = useRef<HTMLDivElement>(null);

  const activarAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    if (unmuteWrapperRef.current) {
      unmuteWrapperRef.current.style.opacity = "0";
      setTimeout(() => {
        if (unmuteWrapperRef.current) {
          unmuteWrapperRef.current.style.display = "none";
        }
      }, 300);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
            0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(249, 115, 22, 0); }
            100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        .unmute-btn {
            animation: pulse-ring 2s infinite;
        }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}} />

      {/* SECCIÓN DEL VIDEO (Pantalla Completa) */}
      <section className="relative w-full h-[100vh] bg-black flex items-center justify-center overflow-hidden">
        
        {/* Video: Abarca toda la pantalla, en mute y autoplay por defecto */}
        <video 
            ref={videoRef}
            id="demoVideo"
            className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
            playsInline 
            autoPlay 
            muted 
            loop
        >
            {/* Video real de FerreOS servido por API para evadir restricciones de volumen/estáticos */}
            <source src="/api/videos/ferreos4x4" type="video/mp4" />
        </video>

        {/* Gradiente superpuesto para leer el texto inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* BOTÓN GIGANTE PARA ACTIVAR AUDIO (En el centro) */}
        <div 
          ref={unmuteWrapperRef}
          id="unmuteWrapper" 
          className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/20" 
          onClick={activarAudio}
        >
            <button className="unmute-btn bg-orange-500 text-white p-6 rounded-full flex flex-col items-center justify-center gap-2 shadow-2xl transition-transform hover:scale-110">
                <VolumeX className="w-12 h-12" />
                <span className="font-black text-xl uppercase tracking-widest">Toca para Escuchar</span>
            </button>
        </div>

        {/* Textos superpuestos al fondo del video */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-12 z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-lg">
                SISTEMA <span className="text-orange-500">FERREOS</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-bold max-w-2xl mx-auto drop-shadow-md">
                Velocidad en el mostrador. Pago único de por vida.
            </p>
            
            <a href="#beneficios" className="inline-block mt-6 animate-bounce text-slate-400 hover:text-white transition-colors">
                <ChevronDown className="w-10 h-10 mx-auto" />
            </a>
        </div>
      </section>

      {/* SECCIÓN DE DESCRIPCIONES CLAVE */}
      <section id="beneficios" className="py-16 px-6 bg-slate-950">
        <div className="max-w-4xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Beneficio 1 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                        <Zap className="text-orange-500 w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Ventas a Velocidad Luz</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Punto de venta diseñado para no usar el mouse. Buscás, elegís cantidad, apretás Enter y cobrás. Compatible con lectora y balanza.
                    </p>
                </div>

                {/* Beneficio 2 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                        <ShieldAlert className="text-orange-500 w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Escudo Anti-Inflación</h3>
                    <p className="text-slate-400 leading-relaxed">
                        ¿Llegó la nueva lista? Seleccioná el proveedor, aplicá el porcentaje de aumento y actualizá todos tus precios de venta en 1 solo clic.
                    </p>
                </div>

                {/* Beneficio 3 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                        <BookOpenCheck className="text-orange-500 w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Chau Libretas de Fiado</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Control total sobre las cuentas corrientes de tus clientes, constructores o gremio. Sabé siempre quién te debe y cuánto.
                    </p>
                </div>

                {/* Beneficio 4 */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl hover:border-orange-500/50 transition-colors">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                        <WifiOff className="text-orange-500 w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Sin Internet. Pago Único.</h3>
                    <p className="text-slate-400 leading-relaxed">
                        El sistema se instala en tu PC y funciona aunque se corte internet. No hay mensualidades ni alquileres eternos. Es tuyo para siempre.
                    </p>
                </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="text-center bg-slate-900 p-10 rounded-3xl border-2 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">¿Listo para modernizar tu ferretería?</h2>
                <p className="text-slate-300 text-lg mb-8">Escribinos ahora para reservar tu licencia vitalicia con descuento de lanzamiento.</p>
                
                <a href="https://wa.me/5491155792551?text=Hola,%20quiero%20más%20info%20de%20FerreOS!" target="_blank" className="inline-flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white text-2xl font-black py-5 px-10 rounded-xl transition-transform hover:scale-105 shadow-xl w-full md:w-auto">
                    <MessageCircle className="w-8 h-8" />
                    HABLAR POR WHATSAPP
                </a>
            </div>

        </div>
      </section>
    </div>
  );
}
