'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}

interface GitHubContextType {
  user: GitHubUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  setToken: (token: string, user: GitHubUser) => void;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export function GitHubProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('github_token');
    const storedUser = localStorage.getItem('github_user');
    
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(() => {
    // For now, we'll implement a simple token-based auth
    // In production, this would redirect to GitHub OAuth
    const token = prompt('Enter your GitHub Personal Access Token:\n\nCreate one at: https://github.com/settings/tokens\nRequired scopes: repo, user:email');
    
    if (token) {
      // Fetch user info
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          const githubUser: GitHubUser = {
            login: userData.login,
            name: userData.name || userData.login,
            avatar_url: userData.avatar_url,
            email: userData.email,
          };
          
          localStorage.setItem('github_token', token);
          localStorage.setItem('github_user', JSON.stringify(githubUser));
          
          setAccessToken(token);
          setUser(githubUser);
        })
        .catch((error) => {
          console.error('Failed to authenticate with GitHub:', error);
          alert('Failed to authenticate. Please check your token.');
        });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    setAccessToken(null);
    setUser(null);
  }, []);

  const setToken = useCallback((token: string, githubUser: GitHubUser) => {
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_user', JSON.stringify(githubUser));
    setAccessToken(token);
    setUser(githubUser);
  }, []);

  return (
    <GitHubContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
        setToken,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
}
