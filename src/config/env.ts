import { z } from 'zod';

/**
 * Centralized, validated environment configuration.
 *
 * Every environment-specific value the app depends on is declared here and
 * validated at module load. If a required variable is missing or malformed the
 * app fails fast with a clear message instead of surfacing a cryptic error deep
 * in the Supabase client. Nothing else in the codebase should read
 * `import.meta.env` directly.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_ANON_KEY is required'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Invalid environment configuration. Check your .env file:\n${issues}\n` +
      `See .env.example for the required variables.`,
  );
}

export const env = {
  supabaseUrl: parsed.data.VITE_SUPABASE_URL,
  supabaseAnonKey: parsed.data.VITE_SUPABASE_ANON_KEY,
} as const;
