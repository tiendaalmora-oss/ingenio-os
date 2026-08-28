"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sun, Target, Sparkles, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { saveMorningBrief } from "@/app/actions";

interface MorningBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userName: string;
  topQueue: Array<{ id: string; title: string; expectedImpact: number; reason: string }>;
  mainDna: string;
}

export function MorningBriefingModal({
  isOpen,
  onClose,
  workspaceId,
  userName,
  topQueue,
  mainDna
}: MorningBriefingModalProps) {
  const [oneThing, setOneThing] = useState(
    topQueue[0]?.title || "Ajustar Presupuesto de Ads Q3 y desbloquear canal de ventas"
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleStartDay = async () => {
    setIsSaving(true);
    await saveMorningBrief(workspaceId, {
      oneThing,
      reviewedQueue: topQueue.slice(0, 3).map(q => q.title),
      timestamp: new Date().toISOString()
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-amber-400" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-500/90 uppercase font-semibold">
                Ritual Matutino • Chief of Staff Briefing
              </span>
              <h2 className="text-2xl font-light text-foreground">
                Buenos días, <span className="font-medium">{userName}</span>.
              </h2>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary bg-primary/5">
            SISTEMAS NOMINALES
          </Badge>
        </div>

        {/* Telemetry / Context Pulse */}
        <div className="p-4 rounded-xl bg-background/60 border border-border/50 text-sm leading-relaxed text-muted-foreground flex gap-3 items-start">
          <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground font-medium mb-1">Diagnóstico del Executive Engine:</p>
            <p>
              Hoy la prioridad estratégica es proteger caja y acelerar conversión comercial. Tu principio rector activo:{" "}
              <strong className="text-foreground">"{mainDna}"</strong>.
            </p>
          </div>
        </div>

        {/* The One Thing (Priority Hero) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>La Prioridad Absoluta de Hoy (The One Thing)</span>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/30">
            <input
              value={oneThing}
              onChange={(e) => setOneThing(e.target.value)}
              className="w-full bg-transparent text-lg font-medium text-foreground focus:outline-none placeholder:text-muted-foreground"
              placeholder="¿Cuál es la única cosa que hará que el día sea exitoso?"
            />
          </div>
        </div>

        {/* Top 3 High-Impact Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              Acciones de Mayor Impacto Seleccionadas por el Engine:
            </span>
            <span className="text-[10px] text-muted-foreground/70">Top 3 Queue</span>
          </div>

          <div className="space-y-2">
            {(topQueue.slice(0, 3).length > 0 ? topQueue.slice(0, 3) : [
              { id: '1', title: 'Ajustar Presupuesto de Ads Q3', expectedImpact: 85, reason: 'Desviación de CAC' },
              { id: '2', title: 'Aprobar Contratación Lead Dev', expectedImpact: 70, reason: 'Bloqueo técnico' },
              { id: '3', title: 'Contacto con 5 Leads Calificados', expectedImpact: 65, reason: 'Acelerar meta mensual' }
            ]).map((action, idx) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/40 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary text-[11px] font-mono flex items-center justify-center text-muted-foreground">
                    0{idx + 1}
                  </div>
                  <span className="font-medium text-foreground">{action.title}</span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary">
                  Impact {action.expectedImpact}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy Reminder */}
        <div className="text-center py-1">
          <p className="text-xs text-muted-foreground italic">
            "Si completas únicamente estas acciones críticas hoy, la jornada habrá sido un éxito rotundo."
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartDay}
          disabled={isSaving}
          size="lg"
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base h-12 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <span>Registrando briefing...</span>
          ) : (
            <>
              <span>Iniciar Misión del Día</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>

      </div>
    </div>
  );
}
