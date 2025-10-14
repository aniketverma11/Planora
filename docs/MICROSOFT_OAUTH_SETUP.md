# Microsoft OAuth SSO Setup Guide

## Overview
This guide will help you set up Microsoft OAuth Single Sign-On (SSO) for the Task Management application.

## Prerequisites
- Microsoft Azure account
- Admin access to Azure Portal

## Step 1: Register Your Application in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the application details:
   - **Name**: Task Management App (or your preferred name)
   - **Supported account types**: 
     - Choose "Accounts in any organizational directory and personal Microsoft accounts" for common tenant
     - Or select specific option based on your needs
   - **Redirect URI**: 
     - Platform: Web
     - URL: `http://localhost:3000` (for development)
5. Click **Register**

## Step 2: Get Client ID and Create Client Secret

### Get Client ID
1. After registration, you'll see the **Overview** page
2. Copy the **Application (client) ID** - this is your `MICROSOFT_CLIENT_ID`
3. Copy the **Directory (tenant) ID** - this is your `MICROSOFT_TENANT_ID`

### Create Client Secret
1. In the left menu, click **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g., "Task Management App Secret")
4. Choose expiration period (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately - this is your `MICROSOFT_CLIENT_SECRET`
   - ⚠️ You won't be able to see it again after leaving this page!

## Step 3: Configure API Permissions

1. In the left menu, click **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read` (should be already added by default)
   - `email`
   - `profile`
   - `openid`
6. Click **Add permissions**
7. (Optional) Click **Grant admin consent** for your organization

## Step 4: Configure Authentication Settings

1. In the left menu, click **Authentication**
2. Under **Platform configurations**, click on your Web platform
3. Add additional redirect URIs if needed:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
4. Under **Implicit grant and hybrid flows**, check:
   - ✅ **Access tokens** (used for implicit flows)
   - ✅ **ID tokens** (used for implicit and hybrid flows)
5. Under **Advanced settings**:
   - Allow public client flows: **No** (default)
6. Click **Save**

## Step 5: Configure Backend Environment Variables

Edit the `.env` file in your Django project root:

```env
# Microsoft OAuth Settings
MICROSOFT_CLIENT_ID=your-application-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-value-here
MICROSOFT_TENANT_ID=common
# Use 'common' for multi-tenant, or your specific tenant ID for single-tenant
MICROSOFT_REDIRECT_URI=http://localhost:3000
```

**Important Notes:**
- Replace `your-application-client-id-here` with your actual Application (client) ID
- Replace `your-client-secret-value-here` with your actual client secret value
- Use `MICROSOFT_TENANT_ID=common` for personal and work/school accounts
- Use specific tenant ID for organization-only accounts

## Step 6: Configure Frontend Environment Variables

Edit the `.env` file in your React frontend:

```env
# Microsoft OAuth Configuration
REACT_APP_MICROSOFT_CLIENT_ID=your-application-client-id-here
REACT_APP_MICROSOFT_TENANT_ID=common
```

## Step 7: Install Dependencies

### Backend
```bash
cd task_management
.\env\Scripts\Activate.ps1  # On Windows
pip install msal
```

### Frontend
```bash
cd frontend
npm install @azure/msal-browser @azure/msal-react
```

## Step 8: Run Database Migrations

```bash
cd task_management
python manage.py migrate
```

## Step 9: Start the Application

### Backend
```bash
cd task_management
python manage.py runserver 8001
```

### Frontend
```bash
cd frontend
npm start
```

## Step 10: Test Microsoft Sign-In

1. Open your browser and go to `http://localhost:3000`
2. Click on **Login** or **Sign Up**
3. Click the **Sign in with Microsoft** button
4. You'll be redirected to Microsoft login page
5. Sign in with your Microsoft account
6. Grant permissions to the application
7. You'll be redirected back to the application and logged in

## Troubleshooting

### Common Issues

1. **"AADSTS700016: Application not found in the directory"**
   - Solution: Check that `MICROSOFT_CLIENT_ID` matches your Application ID in Azure Portal
   - Verify you're using the correct tenant ID

2. **"AADSTS50011: Reply URL mismatch"**
   - Solution: Ensure the redirect URI in Azure Portal matches your application URL
   - Add all necessary redirect URIs (development + production)

3. **"Invalid client secret"**
   - Solution: Client secret might have expired or is incorrect
   - Generate a new client secret in Azure Portal

4. **"User does not have permission to access this resource"**
   - Solution: Grant admin consent for API permissions in Azure Portal
   - Verify required permissions are added

5. **"CORS policy error"**
   - Solution: Ensure CORS is properly configured in Django settings
   - Check that frontend URL is allowed in backend CORS settings

### Debug Tips

1. **Enable Debug Logging**:
   - Frontend: Check browser console for detailed error messages
   - Backend: Check Django logs for authentication errors

2. **Verify Token**:
   - Ensure access token is being sent to backend
   - Check token expiration

3. **Network Issues**:
   - Use browser DevTools Network tab to inspect API calls
   - Verify requests are reaching the backend

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate client secrets** regularly (every 6-12 months)
3. **Use specific tenant IDs** in production (not 'common')
4. **Enable multi-factor authentication** for production
5. **Review and limit API permissions** to only what's needed
6. **Use HTTPS** in production environments
7. **Set appropriate token expiration times**

## Production Deployment

### Additional Steps for Production:

1. **Update Redirect URIs** in Azure Portal:
   - Add your production domain URL
   - Remove localhost URLs for security

2. **Update Environment Variables**:
   - Use production URLs in `.env` files
   - Use specific tenant ID instead of 'common'

3. **Enable HTTPS**:
   - Configure SSL certificates
   - Update all URLs to use https://

4. **Configure CORS**:
   - Update Django CORS settings for production domain
   - Remove localhost from allowed origins

## Support and Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL Python Documentation](https://msal-python.readthedocs.io/)
- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)

## Testing Checklist

- [ ] Azure app registration created
- [ ] Client ID and secret configured in backend `.env`
- [ ] Client ID configured in frontend `.env`
- [ ] API permissions granted
- [ ] Redirect URIs configured correctly
- [ ] Dependencies installed (backend and frontend)
- [ ] Database migrations applied
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Successfully logged in with Microsoft account
- [ ] User profile data retrieved correctly
- [ ] JWT tokens generated and stored
- [ ] Authentication persists across page refreshes

---

**Created**: 2025
**Last Updated**: 2025
**Version**: 1.0
