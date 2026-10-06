const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'refreshToken', 'secret', 'authorization'];

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      sanitized[key] = sanitize(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

function outputLog(level, message, meta) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta) {
    Object.assign(payload, sanitize(meta));
  }

  const jsonString = JSON.stringify(payload);
  if (level === 'error') {
    console.error(jsonString);
  } else if (level === 'warn') {
    console.warn(jsonString);
  } else {
    console.log(jsonString);
  }
}

export const logger = {
  info: (msg, meta) => outputLog('info', msg, meta),
  warn: (msg, meta) => outputLog('warn', msg, meta),
  error: (msg, meta) => outputLog('error', msg, meta),
  debug: (msg, meta) => outputLog('debug', msg, meta),
};
