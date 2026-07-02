"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, TrendingUp, Code, Megaphone, Terminal, Focus } from "lucide-react";
import { useExecutiveState } from "@/lib/executive-store";

export function MissionControlUI({ user, workspace, decisions, dna }: any) {
  const { cognitiveMode, setCognitiveMode, isFocusMode, setFocusMode } = useExecutiveState();
  const mainDna = dna?.length > 0 ? dna[0].content : "El flujo de caja es la prioridad absoluta en la fase actual.";
  const decisionsList = decisions || [];

  if (isFocusMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="max-w-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <Brain className="w-16 h-16 mx-auto text-primary opacity-50" />
          <h1 className="text-4xl font-light tracking-tight">Focus Mode Activo</h1>
          <p className="text-xl text-muted-foreground">
             Misión: <strong>Finalizar Landing FerreOS</strong>
          </p>
          <div className="text-7xl font-mono py-8">01:45:00</div>
          <Button variant="outline" size="lg" onClick={() => setFocusMode(false)}>
            Terminar Sesión de Deep Work
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-16 md:w-64 border-r border-border bg-card/50 flex flex-col justify-between">
        <div className="p-4 flex flex-col items-center md:items-start gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden md:block">Hermes</span>
          </div>

          <nav className="flex flex-col gap-2 w-full">
            <Button 
              variant={cognitiveMode === 'CEO' ? "secondary" : "ghost"} 
              className="justify-start gap-3 w-full"
              onClick={() => setCognitiveMode('CEO')}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:block">CEO Mode</span>
            </Button>
            <Button 
              variant={cognitiveMode === 'CTO' ? "secondary" : "ghost"} 
              className="justify-start gap-3 w-full"
              onClick={() => setCognitiveMode('CTO')}
            >
              <Code className="w-4 h-4" />
              <span className="hidden md:block">CTO Mode</span>
            </Button>
            <Button 
              variant={cognitiveMode === 'CMO' ? "secondary" : "ghost"} 
              className="justify-start gap-3 w-full"
              onClick={() => setCognitiveMode('CMO')}
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden md:block">CMO Mode</span>
            </Button>
            <div className="my-4 border-t border-border/50" />
            <Button 
              variant="outline" 
              className="justify-start gap-3 w-full border-primary/20 text-primary"
              onClick={() => setFocusMode(true)}
            >
              <Focus className="w-4 h-4" />
              <span className="hidden md:block">Focus Mode</span>
            </Button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
           <Avatar className="w-8 h-8 md:w-10 md:h-10">
              <AvatarFallback>EN</AvatarFallback>
            </Avatar>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Buenos días, <span className="font-medium">{user?.name || "Emprendedor"}</span>.</h1>
            <p className="text-muted-foreground mt-1">Modo activo: {cognitiveMode}. Tienes {decisionsList.length} decisiones pendientes.</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-primary/20 text-primary bg-primary/10">
            <Terminal className="w-3 h-3 mr-2 inline" />
            STATUS: {workspace?.name?.toUpperCase() || "NOMINAL"}
          </Badge>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="col-span-1 md:col-span-2 bg-card/40 border-border/50 backdrop-blur-sm shadow-xl">
             <CardHeader>
               <CardTitle className="text-lg">Decisiones Críticas</CardTitle>
               <CardDescription>Requieren tu atención inmediata ({cognitiveMode} DNA alineado)</CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col gap-4">
               {decisionsList.length > 0 ? decisionsList.map((d: any) => (
                <div key={d.id || d.title} className="p-4 rounded-lg bg-background border border-border flex items-start justify-between group hover:border-primary/50 transition-colors">
                  <div>
                    <h3 className="font-medium">{d.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{d.context}</p>
                  </div>
                  <Button size="sm">Decidir</Button>
                </div>
               )) : (
                 <>
                  <div className="p-4 rounded-lg bg-background border border-border flex items-start justify-between group hover:border-primary/50 transition-colors">
                    <div>
                      <h3 className="font-medium">Contratar Lead Developer (Startup B)</h3>
                      <p className="text-sm text-muted-foreground mt-1">Impacto financiero: Alto. Costo de oportunidad evaluado por IA: 15%</p>
                    </div>
                    <Button size="sm">Decidir</Button>
                  </div>
                  <div className="p-4 rounded-lg bg-background border border-border flex items-start justify-between group hover:border-primary/50 transition-colors">
                    <div>
                      <h3 className="font-medium">Pausar Campaña B2B Q3</h3>
                      <p className="text-sm text-muted-foreground mt-1">Desviación del objetivo de CAC en 42%.</p>
                    </div>
                    <Button size="sm" variant="secondary">Decidir</Button>
                  </div>
                 </>
               )}
             </CardContent>
           </Card>

           <Card className="bg-card/40 border-border/50 backdrop-blur-sm shadow-xl">
             <CardHeader>
               <CardTitle className="text-lg">Coach IA ({cognitiveMode})</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex flex-col gap-4">
                 <p className="text-sm leading-relaxed text-muted-foreground">
                   He notado que has pospuesto tareas clave. Tu principio de <strong className="text-foreground">Executive DNA</strong> indica que: "{mainDna}"
                 </p>
                 <Button variant="outline" className="w-full text-xs" size="sm">
                   Iniciar Revisión Guiada
                 </Button>
               </div>
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
}
