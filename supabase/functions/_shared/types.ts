// Deno types for Supabase Edge Functions
declare global {
  namespace Deno {
    export interface Env {
      get(key: string): string | undefined;
    }
    
    export const env: Env;
    
    export function serve(handler: (request: Request) => Response | Promise<Response>): void;
  }
}

export {};
