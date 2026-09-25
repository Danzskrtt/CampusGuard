declare module 'https://esm.sh/@supabase/supabase-js@2.54.0' {
  export function createClient(url: string, key: string, options?: Record<string, unknown>): any;
}

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};
