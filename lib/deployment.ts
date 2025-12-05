/**
 * Deployment utilities for Netlify and Vercel
 * Enables one-click deployment from the IDE
 */

export type DeploymentProvider = 'netlify' | 'vercel';

export interface DeploymentConfig {
  provider: DeploymentProvider;
  apiToken: string;
  siteName?: string;
  projectName?: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  deployId?: string;
  error?: string;
  logs?: string[];
}

export interface DeploymentStatus {
  state: 'queued' | 'building' | 'ready' | 'error';
  url?: string;
  deployId: string;
  createdAt: string;
  errorMessage?: string;
}

/**
 * Deploy to Netlify
 */
export async function deployToNetlify(
  files: Record<string, string>,
  config: DeploymentConfig
): Promise<DeploymentResult> {
  try {
    // Create a zip file of the project
    const formData = new FormData();
    
    // Note: In a real implementation, we would need to zip the files
    // For now, we'll use Netlify's API to create a deploy
    const response = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.siteName || `kode-site-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Netlify site');
    }

    const site = await response.json();
    
    // Deploy files to the site
    // Note: This is simplified - in production, you'd need to upload a zip file
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/zip',
      },
      // body would be the zipped files
    });

    if (!deployResponse.ok) {
      throw new Error('Failed to deploy to Netlify');
    }

    const deploy = await deployResponse.json();

    return {
      success: true,
      url: site.url,
      deployId: deploy.id,
    };
  } catch (error) {
    console.error('[Deployment] Netlify deployment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    };
  }
}

/**
 * Deploy to Vercel
 */
export async function deployToVercel(
  files: Record<string, string>,
  config: DeploymentConfig
): Promise<DeploymentResult> {
  try {
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.projectName || `kode-project-${Date.now()}`,
        files: Object.entries(files).map(([file, content]) => ({
          file,
          data: content,
        })),
        projectSettings: {
          framework: 'nextjs',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deploy to Vercel');
    }

    const deployment = await response.json();

    return {
      success: true,
      url: deployment.url,
      deployId: deployment.id,
    };
  } catch (error) {
    console.error('[Deployment] Vercel deployment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    };
  }
}

/**
 * Get deployment status from Netlify
 */
export async function getNetlifyDeploymentStatus(
  deployId: string,
  apiToken: string
): Promise<DeploymentStatus | null> {
  try {
    const response = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const deploy = await response.json();
    
    return {
      state: deploy.state as DeploymentStatus['state'],
      url: deploy.deploy_ssl_url || deploy.url,
      deployId: deploy.id,
      createdAt: deploy.created_at,
      errorMessage: deploy.error_message,
    };
  } catch (error) {
    console.error('[Deployment] Failed to get Netlify status:', error);
    return null;
  }
}

/**
 * Get deployment status from Vercel
 */
export async function getVercelDeploymentStatus(
  deployId: string,
  apiToken: string
): Promise<DeploymentStatus | null> {
  try {
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deployId}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const deployment = await response.json();
    
    // Map Vercel states to our standard states
    let state: DeploymentStatus['state'];
    switch (deployment.readyState) {
      case 'READY':
        state = 'ready';
        break;
      case 'ERROR':
        state = 'error';
        break;
      case 'BUILDING':
        state = 'building';
        break;
      default:
        state = 'queued';
    }
    
    return {
      state,
      url: deployment.url,
      deployId: deployment.id,
      createdAt: deployment.createdAt,
    };
  } catch (error) {
    console.error('[Deployment] Failed to get Vercel status:', error);
    return null;
  }
}
