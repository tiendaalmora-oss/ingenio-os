import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, MessageSquare, Users, Puzzle, Zap, Split, PlayCircle } from 'lucide-react';

const NODE_CONFIG = {
  event:      { icon: PlayCircle, color: '#4F8CFF', bg: 'rgba(79,140,255,0.1)' },
  whatsapp:   { icon: MessageSquare, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  ai:         { icon: Bot, color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
  crm:        { icon: Users, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  skill:      { icon: Puzzle, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  automation: { icon: Zap, color: '#EAB308', bg: 'rgba(234,179,8,0.1)' },
  condition:  { icon: Split, color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
};

export const BusinessNode = memo(({ data, isConnectable }: any) => {
  const type = data.type as keyof typeof NODE_CONFIG;
  const config = NODE_CONFIG[type] || NODE_CONFIG.event;
  const Icon = config.icon;

  return (
    <div 
      className="relative min-w-[240px] rounded-[18px] p-4 transition-all duration-200"
      style={{
        background: '#181818',
        border: `1px solid rgba(255,255,255,0.06)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${config.bg}`
      }}
    >
      {/* Input Handle (except for trigger events) */}
      {type !== 'event' && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{ background: '#4F8CFF', border: 'none', width: 10, height: 10, top: -5 }}
        />
      )}

      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: config.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: config.color }}>
            {data.category || type}
          </div>
          <div className="text-sm font-medium text-white truncate">
            {data.label || 'Configurar nodo'}
          </div>
          {data.description && (
            <div className="text-xs text-[#9CA3AF] mt-1 line-clamp-2 leading-relaxed">
              {data.description}
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      {type === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            isConnectable={isConnectable}
            style={{ background: '#22C55E', border: 'none', width: 10, height: 10, bottom: -5, left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            isConnectable={isConnectable}
            style={{ background: '#EF4444', border: 'none', width: 10, height: 10, bottom: -5, left: '70%' }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ background: '#4F8CFF', border: 'none', width: 10, height: 10, bottom: -5 }}
        />
      )}
    </div>
  );
});

BusinessNode.displayName = 'BusinessNode';
