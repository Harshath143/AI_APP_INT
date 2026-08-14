/**
 * Dev Console & Log Sanitizer Utility
 * Guarantees Groq API keys (gsk_...) and sensitive Authorization headers
 * are never printed in cleartext to Metro terminal, console logs, or stack traces.
 */

const GROQ_KEY_PATTERN = /gsk_[a-zA-Z0-9_]{16,}/g;
const AUTH_HEADER_PATTERN = /Bearer\s+gsk_[a-zA-Z0-9_]{16,}/gi;

/**
 * Sanitizes a string or serializable object, replacing any Groq API Key with [REDACTED_API_KEY]
 */
export function redactSensitiveData(data: unknown): unknown {
  try {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return data
        .replace(AUTH_HEADER_PATTERN, 'Bearer [REDACTED_API_KEY]')
        .replace(GROQ_KEY_PATTERN, 'gsk_••••••••••••');
    }

    if (data instanceof Error) {
      const msg = typeof data.message === 'string' ? data.message : String(data);
      const errorCopy = new Error(redactSensitiveData(msg) as string);
      errorCopy.name = data.name || 'Error';
      if (data.stack) {
        errorCopy.stack = redactSensitiveData(String(data.stack)) as string;
      }
      return errorCopy;
    }

    if (typeof data === 'object') {
      try {
        const jsonStr = JSON.stringify(data);
        const sanitizedStr = redactSensitiveData(jsonStr) as string;
        return JSON.parse(sanitizedStr);
      } catch {
        return '[Object - Redacted]';
      }
    }

    return data;
  } catch {
    return String(data);
  }
}

/**
 * Overrides console methods in development to automatically sanitize logs.
 */
let isConsoleSanitized = false;

export function setupConsoleSanitizer() {
  if (isConsoleSanitized) return;
  isConsoleSanitized = true;

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: unknown[]) => {
    const sanitizedArgs = args.map(redactSensitiveData);
    originalLog.apply(console, sanitizedArgs);
  };

  console.warn = (...args: unknown[]) => {
    const sanitizedArgs = args.map(redactSensitiveData);
    originalWarn.apply(console, sanitizedArgs);
  };

  console.error = (...args: unknown[]) => {
    const sanitizedArgs = args.map(redactSensitiveData);
    originalError.apply(console, sanitizedArgs);
  };
}

/**
 * Masks an API Key string for display in Settings UI (e.g. gsk_1234... -> gsk_••••••••1234)
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '••••••••••••' + key.slice(-4);
}
