export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
  // at least 6 chars; tweak as needed for complexity
  return typeof password === 'string' && password.length >= 6;
}
