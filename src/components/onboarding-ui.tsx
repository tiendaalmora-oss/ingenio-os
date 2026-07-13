"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions";

const QUESTIONS = [
  { id: "intro", text: "Hola. Soy Hermes, tu Chief of Staff. Para comenzar a optimizar tu ejecución, necesito entender el terreno. ¿Cuál es tu nombre y el de tu empresa?" },
  { id: "industry", text: "¿A qué industria pertenecen y cuáles son sus productos o servicios principales?" },
  { id: "goals", text: "Entendido. Hablemos de metas estratégicas. ¿Cuál es el gran objetivo anual y qué debemos lograr específicamente este trimestre?" },
  { id: "kpis", text: "¿Cuáles son los KPIs (Indicadores Clave) más críticos que debemos monitorear diariamente para saber si estamos ganando?" },
  { id: "operations", text: "Sobre tu forma de operar personal: ¿Cuáles son tus horarios de mayor productividad y qué herramientas tecnológicas utilizas más?" },
  { id: "projects", text: "Actualmente, ¿qué proyectos tienes activos y cuál es la prioridad número uno indiscutible en este momento?" },
  { id: "principles", text: "Finalmente, para poder asesorarte correctamente: ¿qué principios fundamentales rigen tu empresa y cómo sueles tomar las decisiones difíciles?" }
];

export function OnboardingUI() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep, answers, isProcessing]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const currentQ = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [currentQ.id]: inputValue };
    setAnswers(newAnswers);
    setInputValue("");

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsProcessing(true);
      await completeOnboarding(newAnswers);
      router.push("/");
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border/50 flex items-center justify-center bg-card/20 backdrop-blur-md">
         <div className="flex items-center gap-3 opacity-75">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs tracking-[0.2em] uppercase">Hermes Executive Initialization</span>
         </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col gap-10 max-w-3xl mx-auto w-full scroll-smooth" ref={scrollRef}>
        {QUESTIONS.slice(0, currentStep + 1).map((q, idx) => (
          <div key={q.id} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Hermes Question */}
            <div className="flex gap-5 items-start">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-primary/10">
                 <Brain className="w-5 h-5 text-primary" />
               </div>
               <div className="bg-card/50 border border-border/60 p-5 rounded-2xl rounded-tl-none text-lg font-light leading-relaxed shadow-sm">
                 {q.text}
               </div>
            </div>

            {/* User Answer (if answered) */}
            {idx < currentStep && (
              <div className="flex gap-4 items-start justify-end animate-in fade-in slide-in-from-right-8 duration-500">
                 <div className="bg-primary border border-primary/20 text-primary-foreground p-5 rounded-2xl rounded-tr-none text-base shadow-lg max-w-[85%]">
                   {answers[q.id]}
                 </div>
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex gap-5 items-start animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary/20">
                 <CheckCircle2 className="w-5 h-5 text-primary-foreground animate-pulse" />
            </div>
            <div className="bg-card/80 border border-primary/40 text-primary p-5 rounded-2xl rounded-tl-none text-base font-mono shadow-sm">
              Procesando y compilando tu Executive DNA... Inicializando Engine...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      {!isProcessing && (
        <div className="p-6 max-w-3xl mx-auto w-full mb-4">
          <div className="relative flex items-center shadow-lg rounded-xl">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Escribe tu respuesta aquí..."
              className="h-14 pl-6 pr-14 text-base bg-card border-border/80 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl"
              autoFocus
            />
            <Button 
              size="icon" 
              className="absolute right-2 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-95"
              onClick={handleSend}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-4 font-mono uppercase tracking-widest opacity-60">
            Press Enter to submit • Step {currentStep + 1} of {QUESTIONS.length}
          </p>
        </div>
      )}
    </div>
  );
}
