<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ezTwApsNa01mmPuSaom1X7-gL50s10OM

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set the `VITE_API_BASE_URL` in [.env.local](.env.local) to your API Gateway URL (default: `http://localhost:3001/api`)
4. Run the app:
   `npm run dev`

## Environment Variables

- `GEMINI_API_KEY`: Your Gemini API key for AI features
- `VITE_API_BASE_URL`: Base URL for the API Gateway (default: `http://localhost:3001/api`)
- `VITE_ENABLE_MOCK_DATA`: Set to `true` to use mock data instead of real API calls (default: `false`)
