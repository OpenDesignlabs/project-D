import { Hono } from 'hono';
import { SERVER_AI_CONFIG } from '../lib/hf-client';
import type { HealthResponse } from '../types';

export const healthRoute = new Hono();

healthRoute.get('/', (c) => {
  return c.json<HealthResponse>({
    ok:      true,
    version: '0.1.0',
    models: {
      primary:  SERVER_AI_CONFIG.primaryModel,
      debugger: SERVER_AI_CONFIG.debuggerModel,
    },
  });
});
