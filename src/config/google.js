// Google Photos Picker API Configuration
// You need to obtain these from Google Cloud Console:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable the "Google Picker API"
// 4. Create credentials (API Key and OAuth 2.0 Client ID)

export const GOOGLE_CONFIG = {
  // Replace with your actual Google API Key
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,

  // Replace with your actual Google OAuth Client ID
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,

  // Scopes needed for Google Photos Picker
  SCOPES: ["https://www.googleapis.com/auth/photoslibrary.readonly"],

  // Discovery docs for Google APIs
  DISCOVERY_DOCS: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  ],
};

// Instructions for setup:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Google Picker API
// 4. Go to "Credentials" section
// 5. Create an API Key (for API_KEY)
// 6. Create an OAuth 2.0 Client ID (for CLIENT_ID)
//    - Application type: Web application
//    - Add your domain to "Authorized JavaScript origins"
// 7. Set the environment variables or replace the values above
