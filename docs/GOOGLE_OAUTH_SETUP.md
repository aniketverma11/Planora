# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Task Management application.

## Prerequisites
- Google Cloud Platform account
- Your application running on http://localhost:3000 (frontend) and http://localhost:8000 (backend)

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (if you don't have one)
   - Click on the project dropdown in the top bar
   - Click "New Project"
   - Enter a project name (e.g., "Task Management")
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" user type
   - Click "Create"
   - Fill in the required fields:
     * App name: Task Management
     * User support email: your-email@example.com
     * Developer contact information: your-email@example.com
   - Click "Save and Continue"
   - Skip the "Scopes" section (click "Save and Continue")
   - Add test users (your email) if in testing mode
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Task Management Web Client"
   - Authorized JavaScript origins:
     * http://localhost:3000
     * http://127.0.0.1:3000
   - Authorized redirect URIs:
     * http://localhost:3000
     * http://127.0.0.1:3000
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these!)

## Step 2: Configure Backend (.env file)

1. Open the file: `task_management/.env`

2. Replace the placeholder values with your actual Google credentials:
   ```env
   # Google OAuth Settings
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```

3. Example of what it should look like:
   ```env
   # Google OAuth Settings
   GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghijklmnopqrs
   ```

## Step 3: Configure Frontend (.env file)

1. Open the file: `frontend/.env`

2. Replace the placeholder value with your Google Client ID:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

3. Example:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
   ```

## Step 4: Install Backend Dependencies

Run in your backend directory:
```bash
cd task_management
.\env\Scripts\activate
pip install -r requirements.txt
```

## Step 5: Run Database Migrations

```bash
python manage.py migrate
```

## Step 6: Start the Backend Server

```bash
python manage.py runserver 8000
```

## Step 7: Install Frontend Dependencies

In a new terminal, run:
```bash
cd frontend
npm install
```

## Step 8: Start the Frontend Server

```bash
npm start
```

## Step 9: Test Google OAuth

1. Open your browser and go to http://localhost:3000
2. You should see the login page with a "Continue with Google" button
3. Click the Google button
4. Sign in with your Google account
5. You should be automatically logged in and redirected to the dashboard!

## Troubleshooting

### "Invalid Client ID" Error
- Make sure you copied the correct Client ID
- Check that there are no extra spaces in your .env files
- Verify the Client ID matches exactly what's in Google Cloud Console

### "Redirect URI Mismatch" Error
- Ensure you added http://localhost:3000 to the authorized redirect URIs in Google Cloud Console
- Try using http://127.0.0.1:3000 instead

### Backend Authentication Fails
- Check that both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly in backend/.env
- Verify the backend server is running on http://localhost:8000
- Check browser console and terminal logs for specific error messages

### CORS Errors
- Make sure the backend settings.py has CORS configured correctly
- Verify CORS_ALLOWED_ORIGINS includes http://localhost:3000

## Features

### For Users:
- **One-Click Sign In**: Sign in instantly with your Google account
- **Automatic Account Creation**: New users are automatically registered
- **Account Linking**: If you already have an account with the same email, Google OAuth will be linked to it
- **Secure Authentication**: No need to remember passwords
- **Profile Picture**: Your Google profile picture is automatically imported

### Security Features:
- Token verification using Google's official libraries
- Secure JWT token generation
- Email verification through Google
- Protection against token forgery

## API Endpoints

### POST /api/users/google-auth/
Authenticate or register a user using Google OAuth token.

**Request Body:**
```json
{
  "token": "google-oauth-credential-token"
}
```

**Response:**
```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": "https://lh3.googleusercontent.com/...",
    "auth_provider": "google"
  }
}
```

## Environment Variables Reference

### Backend (.env)
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000/api
```

## Important Notes

1. **Never commit .env files** to version control (they are already in .gitignore)
2. **Use different credentials** for production (create a separate OAuth client)
3. **Keep Client Secret secure** - only store on the backend
4. **Test with multiple accounts** to ensure everything works correctly
5. **Review Google's OAuth policies** before deploying to production

## Production Deployment

When deploying to production:

1. Create new OAuth credentials in Google Cloud Console
2. Add your production domain to authorized origins and redirect URIs
3. Update .env files with production values
4. Set DEBUG=False in backend
5. Use environment variables instead of .env files in production
6. Enable HTTPS (required by Google OAuth in production)

## Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the terminal/console for backend errors
3. Verify all environment variables are set correctly
4. Ensure Google OAuth credentials are properly configured
5. Review the troubleshooting section above

---

**Last Updated:** October 13, 2025
