export default `# StudioCMS Environment Variables

# libSQL URL and Token for AstroDB
ASTRO_DB_REMOTE_URL=libsql://your-database.turso.io
ASTRO_DB_APP_TOKEN=

# Auth encryption key
CMS_ENCRYPTION_KEY="..." # openssl rand --base64 16

# credentials for GitHub OAuth
# OPTIONAL: Github redirect URI is optional, and only required if you have multiple redirect URIs
CMS_GITHUB_CLIENT_ID=
CMS_GITHUB_CLIENT_SECRET=
CMS_GITHUB_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/github/callback

# credentials for Discord OAuth
CMS_DISCORD_CLIENT_ID=
CMS_DISCORD_CLIENT_SECRET=
CMS_DISCORD_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/discord/callback

# credentials for Google OAuth
CMS_GOOGLE_CLIENT_ID=
CMS_GOOGLE_CLIENT_SECRET=
CMS_GOOGLE_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/google/callback

# credentials for auth0 OAuth
CMS_AUTH0_CLIENT_ID=
CMS_AUTH0_CLIENT_SECRET=
CMS_AUTH0_DOMAIN=
CMS_AUTH0_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/auth0/callback

## Cloudinary Javascript SDK
CMS_CLOUDINARY_CLOUDNAME="demo"`;
