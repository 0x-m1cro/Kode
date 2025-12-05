'use client';

import { useState } from 'react';
import { Rocket, ExternalLink, X, Key, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useDeployment } from '@/contexts/DeploymentContext';
import { useToast } from './Toast';
import type { WebContainer } from '@webcontainer/api';
import { serializeFileSystem, extractFilesFromTree } from '@/lib/filesystem';
import { deployToNetlify, deployToVercel } from '@/lib/deployment';

interface DeploymentPanelProps {
  webContainer: WebContainer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeploymentPanel({ webContainer, isOpen, onClose }: DeploymentPanelProps) {
  const {
    config,
    deployments,
    setNetlifyToken,
    setVercelToken,
    addDeployment,
    hasNetlifyToken,
    hasVercelToken,
  } = useDeployment();
  
  const { showToast } = useToast();
  const [isDeploying, setIsDeploying] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState<'netlify' | 'vercel' | null>(null);
  const [tokenInput, setTokenInput] = useState('');

  if (!isOpen) return null;

  const handleSaveToken = () => {
    if (!tokenInput.trim()) {
      showToast('Please enter a valid token', 'error');
      return;
    }

    if (showTokenInput === 'netlify') {
      setNetlifyToken(tokenInput);
      showToast('Netlify token saved!', 'success');
    } else if (showTokenInput === 'vercel') {
      setVercelToken(tokenInput);
      showToast('Vercel token saved!', 'success');
    }

    setTokenInput('');
    setShowTokenInput(null);
  };

  const handleDeploy = async (provider: 'netlify' | 'vercel') => {
    if (!webContainer) {
      showToast('WebContainer not ready', 'error');
      return;
    }

    const token = provider === 'netlify' ? config.netlifyToken : config.vercelToken;
    if (!token) {
      showToast(`Please configure ${provider} token first`, 'error');
      setShowTokenInput(provider);
      return;
    }

    setIsDeploying(true);
    try {
      // Serialize the file system
      const fs = await serializeFileSystem(webContainer);
      const filesList = extractFilesFromTree(fs.root);
      
      // Convert to Record<string, string>
      const files: Record<string, string> = {};
      filesList.forEach(({ path, content }) => {
        files[path] = content;
      });

      // Deploy based on provider
      const result = provider === 'netlify'
        ? await deployToNetlify(files, { provider, apiToken: token })
        : await deployToVercel(files, { provider, apiToken: token });

      if (result.success && result.url && result.deployId) {
        const deployment = {
          id: result.deployId,
          provider,
          url: result.url,
          status: 'building' as const,
          createdAt: new Date(),
        };
        
        addDeployment(deployment);
        showToast(`Deploying to ${provider}...`, 'success');
      } else {
        showToast(result.error || 'Deployment failed', 'error');
      }
    } catch (error) {
      console.error('Deployment error:', error);
      showToast('Deployment failed', 'error');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Deploy Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Token Input */}
          {showTokenInput && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Configure {showTokenInput === 'netlify' ? 'Netlify' : 'Vercel'} Token
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {showTokenInput === 'netlify'
                  ? 'Get your token from: https://app.netlify.com/user/applications#personal-access-tokens'
                  : 'Get your token from: https://vercel.com/account/tokens'}
              </p>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste your API token here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveToken}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Token
                </button>
                <button
                  onClick={() => {
                    setShowTokenInput(null);
                    setTokenInput('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Deployment Providers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Netlify */}
            <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-sm">N</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Netlify</span>
                </div>
                {hasNetlifyToken ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Deploy with automatic SSL and CDN
              </p>
              <button
                onClick={() => hasNetlifyToken ? handleDeploy('netlify') : setShowTokenInput('netlify')}
                disabled={isDeploying}
                className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isDeploying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {hasNetlifyToken ? 'Deploy' : 'Configure'}
              </button>
            </div>

            {/* Vercel */}
            <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                    <span className="text-white dark:text-black font-bold text-sm">▲</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">Vercel</span>
                </div>
                {hasVercelToken ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Deploy with Edge Network optimization
              </p>
              <button
                onClick={() => hasVercelToken ? handleDeploy('vercel') : setShowTokenInput('vercel')}
                disabled={isDeploying}
                className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isDeploying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {hasVercelToken ? 'Deploy' : 'Configure'}
              </button>
            </div>
          </div>

          {/* Recent Deployments */}
          {deployments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Recent Deployments</h3>
              <div className="space-y-2">
                {deployments.slice(0, 5).map((deployment) => (
                  <div
                    key={deployment.id}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        deployment.status === 'ready' ? 'bg-green-500' :
                        deployment.status === 'building' ? 'bg-yellow-500 animate-pulse' :
                        deployment.status === 'error' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {deployment.provider}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {deployment.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {deployment.status === 'ready' && (
                      <a
                        href={`https://${deployment.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                      >
                        Visit
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
