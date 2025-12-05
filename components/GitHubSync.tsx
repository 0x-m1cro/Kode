'use client';

import { useState } from 'react';
import { Github, GitBranch, Upload, Download, RefreshCw, Plus, X } from 'lucide-react';
import { useGitHub } from '@/contexts/GitHubContext';
import { useToast } from './Toast';
import type { WebContainer } from '@webcontainer/api';
import {
  initRepo,
  addFiles,
  commit,
  push,
  pull,
  addRemote,
  createGitHubRepo,
  getCurrentBranch,
  getStatus,
} from '@/lib/git-operations';

interface GitHubSyncProps {
  webContainer: WebContainer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubSync({ webContainer, isOpen, onClose }: GitHubSyncProps) {
  const { user, accessToken, isAuthenticated, login, logout } = useGitHub();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([]);

  if (!isOpen) return null;

  const loadGitStatus = async () => {
    if (!webContainer) return;
    
    try {
      const branch = await getCurrentBranch(webContainer);
      setCurrentBranch(branch);
      
      const files = await getStatus(webContainer);
      setModifiedFiles(files);
    } catch (error) {
      console.error('Failed to load git status:', error);
    }
  };

  const handleCreateRepo = async () => {
    if (!webContainer || !accessToken || !user) return;
    
    setIsLoading(true);
    try {
      // Create repository on GitHub
      const { clone_url } = await createGitHubRepo(
        repoName,
        repoDescription,
        isPrivate,
        accessToken
      );
      
      // Initialize local repo
      await initRepo(webContainer, {
        name: user.name,
        email: user.email || `${user.login}@users.noreply.github.com`,
        token: accessToken,
      });
      
      // Add remote
      await addRemote(webContainer, 'origin', clone_url);
      
      // Stage all files
      await addFiles(webContainer);
      
      // Initial commit
      await commit(webContainer, 'Initial commit', {
        name: user.name,
        email: user.email || `${user.login}@users.noreply.github.com`,
        token: accessToken,
      });
      
      // Push to GitHub
      await push(webContainer, 'origin', 'main', {
        name: user.name,
        email: user.email || `${user.login}@users.noreply.github.com`,
        token: accessToken,
      });
      
      showToast('Repository created and pushed to GitHub!', 'success');
      setShowCreateRepo(false);
      setRepoName('');
      setRepoDescription('');
      await loadGitStatus();
    } catch (error) {
      console.error('Failed to create repository:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create repository', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    if (!webContainer || !accessToken || !user) return;
    
    if (!commitMessage.trim()) {
      showToast('Please enter a commit message', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      // Stage all files
      await addFiles(webContainer);
      
      // Commit
      await commit(webContainer, commitMessage, {
        name: user.name,
        email: user.email || `${user.login}@users.noreply.github.com`,
        token: accessToken,
      });
      
      // Push
      await push(webContainer, 'origin', currentBranch, {
        name: user.name,
        email: user.email || `${user.login}@users.noreply.github.com`,
        token: accessToken,
      });
      
      showToast('Changes pushed to GitHub!', 'success');
      setCommitMessage('');
      await loadGitStatus();
    } catch (error) {
      console.error('Failed to push:', error);
      showToast(error instanceof Error ? error.message : 'Failed to push changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    if (!webContainer || !accessToken || !user) return;
    
    setIsLoading(true);
    try {
      await pull(webContainer, 'origin', currentBranch, {
        name: user.name,
        email: user.email || `${user.login}@users.noreply.github.com`,
        token: accessToken,
      });
      
      showToast('Changes pulled from GitHub!', 'success');
      await loadGitStatus();
    } catch (error) {
      console.error('Failed to pull:', error);
      showToast(error instanceof Error ? error.message : 'Failed to pull changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Github className="w-6 h-6 text-gray-900 dark:text-white" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              GitHub Integration
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
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <Github className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Connect to GitHub
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Authenticate with GitHub to push, pull, and manage repositories
              </p>
              <button
                onClick={login}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <Github className="w-5 h-5" />
                Sign in with GitHub
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user?.avatar_url}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user?.login}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Sign out
                </button>
              </div>

              {/* Current Branch */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <GitBranch className="w-4 h-4" />
                <span>Current branch: <strong className="text-gray-900 dark:text-white">{currentBranch}</strong></span>
                <button
                  onClick={loadGitStatus}
                  className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Modified Files */}
              {modifiedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Modified files ({modifiedFiles.length}):
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {modifiedFiles.map((file) => (
                      <div
                        key={file}
                        className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showCreateRepo ? (
                /* Create Repository Form */
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white">Create New Repository</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repository Name *
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="my-awesome-project"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={repoDescription}
                      onChange={(e) => setRepoDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Built with Kode IDE"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <label htmlFor="private" className="text-sm text-gray-700 dark:text-gray-300">
                      Private repository
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateRepo}
                      disabled={isLoading || !repoName.trim()}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Creating...' : 'Create Repository'}
                    </button>
                    <button
                      onClick={() => setShowCreateRepo(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateRepo(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600"
                >
                  <Plus className="w-5 h-5" />
                  Create New Repository
                </button>
              )}

              {/* Push Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Commit & Push Changes
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handlePush}
                  disabled={isLoading || !commitMessage.trim()}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Push to GitHub
                </button>
              </div>

              {/* Pull Section */}
              <button
                onClick={handlePull}
                disabled={isLoading}
                className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Download className="w-4 h-4" />
                Pull from GitHub
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
