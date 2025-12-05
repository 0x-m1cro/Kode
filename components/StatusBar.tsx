'use client';

import { GitBranch, Server, Cpu, Zap } from 'lucide-react';
import type { WebContainer } from '@webcontainer/api';

interface StatusBarProps {
  webContainer: WebContainer | null;
  isBooting: boolean;
  isMock: boolean;
  port?: number;
  modelName?: string;
}

export default function StatusBar({ 
  webContainer, 
  isBooting, 
  isMock,
  port = 3000,
  modelName = 'Claude 3.5 Sonnet'
}: StatusBarProps) {
  const getStatusColor = () => {
    if (webContainer) return 'text-emerald-500';
    if (isBooting) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (webContainer) return 'Ready';
    if (isBooting) return 'Booting...';
    return 'Error';
  };

  return (
    <div className="h-7 bg-gray-800 dark:bg-gray-950 border-t border-gray-700 flex items-center px-3 text-xs text-gray-300">
      {/* Container Status */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 ${getStatusColor()}`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        {isMock && (
          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Mock Mode
          </span>
        )}
      </div>

      <div className="mx-3 h-4 w-px bg-gray-600" />

      {/* Git Branch (Mock for now) */}
      <div className="flex items-center gap-1.5 text-gray-400">
        <GitBranch className="w-3.5 h-3.5" />
        <span>main</span>
      </div>

      <div className="mx-3 h-4 w-px bg-gray-600" />

      {/* Port Number */}
      {webContainer && (
        <>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Server className="w-3.5 h-3.5" />
            <span>Port: {port}</span>
          </div>
          <div className="mx-3 h-4 w-px bg-gray-600" />
        </>
      )}

      {/* LLM Model */}
      <div className="flex items-center gap-1.5 text-gray-400">
        <Zap className="w-3.5 h-3.5" />
        <span>{modelName}</span>
      </div>

      <div className="mx-3 h-4 w-px bg-gray-600" />

      {/* System Info */}
      <div className="flex items-center gap-1.5 text-gray-400">
        <Cpu className="w-3.5 h-3.5" />
        <span>Node.js {isMock ? '(Mock)' : 'v18'}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side info */}
      <div className="text-gray-500">
        Kode IDE v2.0
      </div>
    </div>
  );
}
