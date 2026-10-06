export function validateRegister(body) {
  const errors = [];
  const { fullName, email, password } = body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long.');
  } else if (fullName.trim().length > 255) {
    errors.push('Full name must not exceed 255 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  } else if (password.length > 100) {
    errors.push('Password must not exceed 100 characters.');
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' '),
    data: errors.length === 0 ? {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    } : null,
  };
}

export function validateLogin(body) {
  const errors = [];
  const { email, password } = body || {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    error: errors.join(' '),
    data: errors.length === 0 ? {
      email: email.trim().toLowerCase(),
      password,
    } : null,
  };
}
