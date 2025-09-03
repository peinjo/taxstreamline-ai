// Utility to clean up console.log statements in production
// This should be used during build process to remove debug logs

export const cleanupConsole = () => {
  if (import.meta.env.PROD) {
    // In production, replace console methods with no-ops for performance
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Keep console.warn and console.error for important messages
  }
};

// Call during app initialization
if (import.meta.env.PROD) {
  cleanupConsole();
}
