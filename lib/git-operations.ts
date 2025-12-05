/**
 * Git operations using isomorphic-git for client-side git functionality
 * Enables push, pull, commit, and repository management
 */

import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import type { WebContainer } from '@webcontainer/api';

export interface GitConfig {
  name: string;
  email: string;
  token: string;
}

export interface CommitInfo {
  oid: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      timestamp: number;
    };
  };
}

/**
 * Initialize a git repository in the WebContainer
 */
export async function initRepo(container: WebContainer, config: GitConfig): Promise<void> {
  const fs = container.fs;
  
  try {
    await git.init({ 
      fs: fs as any,
      dir: '/',
      defaultBranch: 'main'
    });
    
    // Configure git user
    await git.setConfig({
      fs: fs as any,
      dir: '/',
      path: 'user.name',
      value: config.name,
    });
    
    await git.setConfig({
      fs: fs as any,
      dir: '/',
      path: 'user.email',
      value: config.email,
    });
    
    console.log('[Git] Repository initialized');
  } catch (error) {
    console.error('[Git] Failed to initialize repository:', error);
    throw error;
  }
}

/**
 * Clone a repository into the WebContainer
 */
export async function cloneRepo(
  container: WebContainer,
  url: string,
  config: GitConfig
): Promise<void> {
  const fs = container.fs;
  
  try {
    await git.clone({
      fs: fs as any,
      http,
      dir: '/',
      url,
      corsProxy: 'https://cors.isomorphic-git.org',
      singleBranch: true,
      depth: 1,
      onAuth: () => ({ username: config.token }),
    });
    
    console.log('[Git] Repository cloned successfully');
  } catch (error) {
    console.error('[Git] Failed to clone repository:', error);
    throw error;
  }
}

/**
 * Add files to staging area
 */
export async function addFiles(
  container: WebContainer,
  files: string[] = ['.']
): Promise<void> {
  const fs = container.fs;
  
  try {
    for (const file of files) {
      await git.add({
        fs: fs as any,
        dir: '/',
        filepath: file,
      });
    }
    
    console.log('[Git] Files added to staging area');
  } catch (error) {
    console.error('[Git] Failed to add files:', error);
    throw error;
  }
}

/**
 * Commit staged changes
 */
export async function commit(
  container: WebContainer,
  message: string,
  config: GitConfig
): Promise<string> {
  const fs = container.fs;
  
  try {
    const sha = await git.commit({
      fs: fs as any,
      dir: '/',
      message,
      author: {
        name: config.name,
        email: config.email,
      },
    });
    
    console.log('[Git] Committed:', sha);
    return sha;
  } catch (error) {
    console.error('[Git] Failed to commit:', error);
    throw error;
  }
}

/**
 * Push changes to remote repository
 */
export async function push(
  container: WebContainer,
  remote: string,
  branch: string,
  config: GitConfig
): Promise<void> {
  const fs = container.fs;
  
  try {
    await git.push({
      fs: fs as any,
      http,
      dir: '/',
      remote,
      ref: branch,
      corsProxy: 'https://cors.isomorphic-git.org',
      onAuth: () => ({ username: config.token }),
    });
    
    console.log('[Git] Pushed to remote');
  } catch (error) {
    console.error('[Git] Failed to push:', error);
    throw error;
  }
}

/**
 * Pull changes from remote repository
 */
export async function pull(
  container: WebContainer,
  remote: string,
  branch: string,
  config: GitConfig
): Promise<void> {
  const fs = container.fs;
  
  try {
    await git.pull({
      fs: fs as any,
      http,
      dir: '/',
      ref: branch,
      corsProxy: 'https://cors.isomorphic-git.org',
      singleBranch: true,
      onAuth: () => ({ username: config.token }),
      author: {
        name: config.name,
        email: config.email,
      },
    });
    
    console.log('[Git] Pulled from remote');
  } catch (error) {
    console.error('[Git] Failed to pull:', error);
    throw error;
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(container: WebContainer): Promise<string> {
  const fs = container.fs;
  
  try {
    const branch = await git.currentBranch({
      fs: fs as any,
      dir: '/',
      fullname: false,
    });
    
    return branch || 'main';
  } catch (error) {
    console.error('[Git] Failed to get current branch:', error);
    return 'main';
  }
}

/**
 * Get git status
 */
export async function getStatus(container: WebContainer): Promise<string[]> {
  const fs = container.fs;
  
  try {
    const status = await git.statusMatrix({
      fs: fs as any,
      dir: '/',
    });
    
    const modified = status
      .filter(([, head, workdir]) => head !== workdir)
      .map(([filepath]) => filepath);
    
    return modified;
  } catch (error) {
    console.error('[Git] Failed to get status:', error);
    return [];
  }
}

/**
 * Get commit log
 */
export async function getLog(
  container: WebContainer,
  depth: number = 10
): Promise<CommitInfo[]> {
  const fs = container.fs;
  
  try {
    const commits = await git.log({
      fs: fs as any,
      dir: '/',
      depth,
    });
    
    return commits as CommitInfo[];
  } catch (error) {
    console.error('[Git] Failed to get log:', error);
    return [];
  }
}

/**
 * Add remote repository
 */
export async function addRemote(
  container: WebContainer,
  name: string,
  url: string
): Promise<void> {
  const fs = container.fs;
  
  try {
    await git.addRemote({
      fs: fs as any,
      dir: '/',
      remote: name,
      url,
    });
    
    console.log('[Git] Remote added:', name, url);
  } catch (error) {
    console.error('[Git] Failed to add remote:', error);
    throw error;
  }
}

/**
 * Create a new repository on GitHub
 */
export async function createGitHubRepo(
  name: string,
  description: string,
  isPrivate: boolean,
  token: string
): Promise<{ url: string; clone_url: string }> {
  try {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: false,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repository');
    }
    
    const repo = await response.json();
    console.log('[Git] Repository created on GitHub:', repo.full_name);
    
    return {
      url: repo.html_url,
      clone_url: repo.clone_url,
    };
  } catch (error) {
    console.error('[Git] Failed to create GitHub repository:', error);
    throw error;
  }
}
