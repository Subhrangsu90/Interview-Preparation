import { z } from 'zod';
import { LogLevel } from 'logger';

export const environmentSchema = z.object({
  production: z.boolean(),
  apiUrl: z.url({ message: 'apiUrl must be a valid URL' }),
  logLevel: z.union([
    z.literal(LogLevel.DEBUG),
    z.literal(LogLevel.INFO),
    z.literal(LogLevel.WARN),
    z.literal(LogLevel.ERROR),
  ]),
  enableColorLogs: z.boolean().default(true),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * Validates the raw environment object against environmentSchema.
 * Throws a formatted Error if any properties are invalid or missing.
 */
export function validateEnvironment(rawEnv: unknown): Environment {
  const result = environmentSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => ` - [${issue.path.join('.')}]: ${issue.message}`)
      .join('\n');

    throw new Error(
      `[Environment Validation Failed]\n${errorDetails}\nPlease fix your environment configuration file.`
    );
  }

  return result.data;
}
