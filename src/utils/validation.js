// Validation utilities for the hackathon platform

// Email validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Roll number validation (alphanumeric, 6-12 characters)
export const validateRollNumber = (rollNumber) => {
  const regex = /^[A-Z0-9]{6,12}$/i;
  return regex.test(rollNumber);
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// GitHub URL validation
export const validateGitHubURL = (url) => {
  return validateURL(url) && url.includes('github.com');
};

// Loom URL validation
export const validateLoomURL = (url) => {
  return validateURL(url) && url.includes('loom.com');
};
