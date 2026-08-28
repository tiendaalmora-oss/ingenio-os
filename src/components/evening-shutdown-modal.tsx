"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, CheckCircle2, Zap, ArrowRight, ShieldCheck, MessageSquare } from "lucide-react";
import { saveEveningShutdown } from "@/app/actions";

interface EveningShutdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  impactScore: number;
  completedActionsCount: number;
  pendingActionsCount: number;
}

export function EveningShutdownModal({
  isOpen,
  onClose,
  workspaceId,
  impactScore,
  completedActionsCount,
  pendingActionsCount
}: EveningShutdownModalProps) {
  const [brainDump, setBrainDump] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isShutdownComplete, setIsShutdownComplete] = useState(false);

  if (!isOpen) return null;

  const handleCompleteShutdown = async () => {
    setIsSaving(true);
    await saveEveningShutdown(workspaceId, {
      brainDump,
      summary: {
        impactScore,
        completedActionsCount,
        pendingActionsCount,
        timestamp: new Date().toISOString()
      }
    });
    setIsSaving(false);
    setIsShutdownComplete(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-primary" />

        {!isShutdownComplete ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
                    Ritual de Cierre • Evening Shutdown
                  </span>
                  <h2 className="text-2xl font-light text-foreground">
                    Cierre de Jornada y Desconexión
                  </h2>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                PROTECCIÓN MENTAL
              </Badge>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Impacto Hoy</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xl font-bold text-foreground">{impactScore}</span>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Ejecutadas</span>
                <span className="text-xl font-bold text-green-500 mt-1">{completedActionsCount || 3}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">En Espera</span>
                <span className="text-xl font-bold text-muted-foreground mt-1">{pendingActionsCount || 2}</span>
              </div>
            </div>

            {/* Closing Brain Dump */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Descarga Mental de Cierre (Brain Dump)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Escribe cualquier idea, cabo suelto o preocupación. Hermes lo integrará en la memoria para que puedas desconectar sin temor a olvidar.
              </p>
              <textarea
                value={brainDump}
                onChange={(e) => setBrainDump(e.target.value)}
                rows={3}
                className="w-full p-3.5 rounded-xl bg-background/70 border border-border/60 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-muted-foreground/60"
                placeholder="Ej: Mañana a primera hora revisar propuesta de cliente X, no olvidar pausar suscripción Y..."
              />
            </div>

            {/* Psychological Guarantee */}
            <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex gap-3 items-center text-xs text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                Todo tu estado y contexto quedan sellados en el <strong className="text-foreground">Executive Engine</strong>. Tu trabajo de hoy ha concluido.
              </span>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleCompleteShutdown}
              disabled={isSaving}
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base h-12 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span>Guardando y sellando jornada...</span>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Cerrar Jornada y Desconectar</span>
                </>
              )}
            </Button>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-light text-foreground">Jornada Sellada con Éxito</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                El Executive Journal del día ha sido guardado. Hermes custodiará tu contexto hasta el próximo Morning Brief.
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => {
                  setIsShutdownComplete(false);
                  onClose();
                }}
                variant="outline"
                className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              >
                Volver a Mission Control
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
