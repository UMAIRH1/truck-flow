export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name.trim()) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters long";
  return null;
};

export const validateSignInForm = (email: string, password: string) => {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  return { emailError, passwordError };
};

export const validateSignUpForm = (name: string, email: string, password: string) => {
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  return { nameError, emailError, passwordError };
};
