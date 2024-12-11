// Helper function to get environment variable with multiple possible names
const getEnvVar = (key: string): string | undefined => {
  // Try different possible environment variable names
  const possibleNames = [
    `VITE_YOUTUBE_${key}`,
    `VITE_GOOGLE_${key}`,
    `YOUTUBE_${key}`,
    `GOOGLE_${key}`
  ];
  
  for (const name of possibleNames) {
    if (process.env[name]) {
      return process.env[name];
    }
  }
  return undefined;
};

// Validate required environment variables
const requiredEnvVars = {
  CLIENT_ID: getEnvVar('CLIENT_ID'),
  CLIENT_SECRET: getEnvVar('CLIENT_SECRET'),
  API_KEY: getEnvVar('API_KEY'),
  REDIRECT_URI: getEnvVar('REDIRECT_URI')
};

// Log which variables are missing
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
  }
});

// Log environment variable resolution
console.log('\n=== YouTube Config Resolution ===');
console.log('CLIENT_ID:', getEnvVar('CLIENT_ID')?.substring(0, 10) + '...');
console.log('CLIENT_SECRET exists:', !!getEnvVar('CLIENT_SECRET'));
console.log('API_KEY exists:', !!getEnvVar('API_KEY'));
console.log('REDIRECT_URI:', getEnvVar('REDIRECT_URI'));
console.log('==============================\n');

export const youtubeConfig = {
  clientId: getEnvVar('CLIENT_ID'),
  clientSecret: getEnvVar('CLIENT_SECRET'),
  redirectUri: getEnvVar('REDIRECT_URI'),
  apiKey: getEnvVar('API_KEY')
};

// Validate the config object
const isConfigValid = Object.values(youtubeConfig).every(value => !!value);
if (!isConfigValid) {
  console.error('YouTube config validation failed:', {
    hasClientId: !!youtubeConfig.clientId,
    hasClientSecret: !!youtubeConfig.clientSecret,
    redirectUri: youtubeConfig.redirectUri,
    hasApiKey: !!youtubeConfig.apiKey
  });
  throw new Error('YouTube configuration is incomplete. Check environment variables.');
}
