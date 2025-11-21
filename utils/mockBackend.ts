
import { Project } from '../types';
import { MOCK_PROJECTS } from '../constants';

// Simulate backend data structure
interface BackendResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

interface SessionInit {
  sessionId: string;
  project: Project;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBackend = {
  /**
   * Get list of available project templates
   */
  getTemplates: async (): Promise<BackendResponse<{id: string, name: string, description: string}[]>> => {
      await delay(300);
      return {
          status: 'success',
          data: MOCK_PROJECTS.map(p => ({ id: p.id, name: p.name, description: p.description }))
      };
  },

  /**
   * Simulates GET /api/playground/init
   * Allocates a random ID and returns initial project state
   */
  initSession: async (): Promise<BackendResponse<SessionInit>> => {
    await delay(800); // Simulate network latency
    const sessionId = Math.random().toString(36).substring(2, 10);
    
    // Default to CLI Tool
    const template = MOCK_PROJECTS.find(p => p.id === 'cli-tool') || MOCK_PROJECTS[0];

    return {
      status: 'success',
      data: {
        sessionId,
        project: {
          ...template,
          id: sessionId
        }
      }
    };
  },

  /**
   * Load a specific template by ID
   */
  loadTemplate: async (templateId: string): Promise<BackendResponse<SessionInit>> => {
      await delay(600);
      const template = MOCK_PROJECTS.find(p => p.id === templateId) || MOCK_PROJECTS[0];
      const sessionId = Math.random().toString(36).substring(2, 10);
      return {
          status: 'success',
          data: {
              sessionId,
              project: { ...template, id: sessionId }
          }
      };
  },

  /**
   * Simulates POST /api/playground/save
   */
  saveProject: async (sessionId: string, files: any): Promise<BackendResponse<null>> => {
    await delay(500);
    console.log(`[MockBackend] Saved project ${sessionId} with ${Object.keys(files).length} files.`);
    return { status: 'success' };
  },

  /**
   * Simulates POST /api/playground/share
   */
  shareProject: async (sessionId: string): Promise<BackendResponse<{ url: string }>> => {
    await delay(600);
    return {
      status: 'success',
      data: {
        url: `https://origami.dev/p/${sessionId}`
      }
    };
  }
};
