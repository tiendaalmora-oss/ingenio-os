"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sun, Moon, Focus, Sparkles, LayoutDashboard,
  Users, Building2, BrainCircuit, Puzzle, Plug, ArrowRight,
  TrendingUp, Code, Megaphone, Terminal, Command
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (id: string) => void;
  onOpenMorning: () => void;
  onOpenEvening: () => void;
  onOpenFocus: () => void;
  onOpenHermes: () => void;
  onChangeMode: (mode: 'CEO' | 'CTO' | 'CMO') => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  shortcut?: string;
  icon: any;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectNav,
  onOpenMorning,
  onOpenEvening,
  onOpenFocus,
  onOpenHermes,
  onChangeMode
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const COMMANDS: CommandItem[] = [
    {
      id: 'morning',
      category: 'Rituales Ejecutivos',
      title: '☀️ Iniciar Morning Briefing',
      shortcut: 'M',
      icon: Sun,
      action: () => { onOpenMorning(); onClose(); }
    },
    {
      id: 'evening',
      category: 'Rituales Ejecutivos',
      title: '🌙 Ejecutar Evening Shutdown (Cierre de Jornada)',
      shortcut: 'E',
      icon: Moon,
      action: () => { onOpenEvening(); onClose(); }
    },
    {
      id: 'focus',
      category: 'Ejecución & Foco',
      title: '🎯 Entrar en Deep Work (Focus Mode)',
      shortcut: 'F',
      icon: Focus,
      action: () => { onOpenFocus(); onClose(); }
    },
    {
      id: 'hermes',
      category: 'Inteligencia Ejecutiva',
      title: '✨ Consultar a Hermes Chief of Staff',
      shortcut: 'H',
      icon: Sparkles,
      action: () => { onOpenHermes(); onClose(); }
    },
    {
      id: 'ceo_mode',
      category: 'Estados Cognitivos',
      title: '📈 Cambiar a CEO Mode (Rentabilidad & Caja)',
      shortcut: '1',
      icon: TrendingUp,
      action: () => { onChangeMode('CEO'); onClose(); }
    },
    {
      id: 'cto_mode',
      category: 'Estados Cognitivos',
      title: '💻 Cambiar a CTO Mode (Arquitectura & Estabilidad)',
      shortcut: '2',
      icon: Code,
      action: () => { onChangeMode('CTO'); onClose(); }
    },
    {
      id: 'cmo_mode',
      category: 'Estados Cognitivos',
      title: '📣 Cambiar a CMO Mode (Crecimiento & Adquisición)',
      shortcut: '3',
      icon: Megaphone,
      action: () => { onChangeMode('CMO'); onClose(); }
    },
    {
      id: 'nav_dashboard',
      category: 'Navegación',
      title: 'Ir a Mission Control',
      icon: LayoutDashboard,
      action: () => { onSelectNav('dashboard'); onClose(); }
    },
    {
      id: 'nav_skills',
      category: 'Navegación',
      title: 'Ir a Executive Skills & Conectores',
      icon: Puzzle,
      action: () => { onSelectNav('skills'); onClose(); }
    },
    {
      id: 'nav_crm',
      category: 'Navegación',
      title: 'Ir a CRM & Leads',
      icon: Users,
      action: () => { onSelectNav('crm'); onClose(); }
    },
    {
      id: 'nav_studio',
      category: 'Navegación',
      title: 'Ir a Business Studio',
      icon: Building2,
      action: () => { onSelectNav('studio'); onClose(); }
    },
    {
      id: 'nav_memory',
      category: 'Navegación',
      title: 'Ir a Memory Center & DNA',
      icon: BrainCircuit,
      action: () => { onSelectNav('memory'); onClose(); }
    },
  ];

  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="bg-[#141414] border border-white/15 rounded-[20px] max-w-xl w-full shadow-2xl overflow-hidden relative z-10"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-[#4F8CFF] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Escribe un comando o busca una acción ejecutiva..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#9CA3AF] outline-none"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#9CA3AF]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-[#4F8CFF] text-white shadow-md shadow-[#4F8CFF]/20'
                      : 'text-[#D1D5DB] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#4F8CFF]'}`} />
                    <span className="font-medium text-left">{cmd.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono opacity-60 ${isSelected ? 'text-white' : 'text-[#9CA3AF]'}`}>
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        isSelected ? 'border-white/30 text-white' : 'border-white/10 text-[#9CA3AF] bg-white/5'
                      }`}>
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[#9CA3AF]">
              No se encontraron comandos ejecutivos para "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#9CA3AF]">
          <span>Navega con ↑ ↓ • Ejecuta con ENTER</span>
          <span>Hermes Executive OS</span>
        </div>
      </motion.div>
    </div>
  );
}
