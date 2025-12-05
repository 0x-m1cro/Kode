'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { DeploymentProvider } from '@/lib/deployment';

interface DeploymentConfig {
  netlifyToken?: string;
  vercelToken?: string;
}

interface Deployment {
  id: string;
  provider: DeploymentProvider;
  url: string;
  status: 'queued' | 'building' | 'ready' | 'error';
  createdAt: Date;
}

interface DeploymentContextType {
  config: DeploymentConfig;
  deployments: Deployment[];
  setNetlifyToken: (token: string) => void;
  setVercelToken: (token: string) => void;
  addDeployment: (deployment: Deployment) => void;
  updateDeployment: (id: string, updates: Partial<Deployment>) => void;
  hasNetlifyToken: boolean;
  hasVercelToken: boolean;
}

const DeploymentContext = createContext<DeploymentContextType | undefined>(undefined);

export function DeploymentProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DeploymentConfig>(() => {
    if (typeof window === 'undefined') return {};
    
    return {
      netlifyToken: localStorage.getItem('netlify_token') || undefined,
      vercelToken: localStorage.getItem('vercel_token') || undefined,
    };
  });
  
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  const setNetlifyToken = useCallback((token: string) => {
    localStorage.setItem('netlify_token', token);
    setConfig((prev) => ({ ...prev, netlifyToken: token }));
  }, []);

  const setVercelToken = useCallback((token: string) => {
    localStorage.setItem('vercel_token', token);
    setConfig((prev) => ({ ...prev, vercelToken: token }));
  }, []);

  const addDeployment = useCallback((deployment: Deployment) => {
    setDeployments((prev) => [deployment, ...prev]);
  }, []);

  const updateDeployment = useCallback((id: string, updates: Partial<Deployment>) => {
    setDeployments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  return (
    <DeploymentContext.Provider
      value={{
        config,
        deployments,
        setNetlifyToken,
        setVercelToken,
        addDeployment,
        updateDeployment,
        hasNetlifyToken: !!config.netlifyToken,
        hasVercelToken: !!config.vercelToken,
      }}
    >
      {children}
    </DeploymentContext.Provider>
  );
}

export function useDeployment() {
  const context = useContext(DeploymentContext);
  if (context === undefined) {
    throw new Error('useDeployment must be used within a DeploymentProvider');
  }
  return context;
}
