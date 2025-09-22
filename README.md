# EventRSVP - Event Management and RSVP Collection

A modern event management application built with Next.js and Auth0 authentication.

## Features

- **Google Authentication** via Auth0
- **Event Creation & Management**
- **RSVP Collection & Tracking**
- **Premium Analytics Dashboard**
- **Payment Integration** with Square

## Environment Variables

To run this project, you'll need to add the following environment variables:

### Auth0 Configuration
\`\`\`
AUTH0_SECRET=your_auth0_secret_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
\`\`\`

### Square Payment Configuration
\`\`\`
SQUARE_WEBHOOK_SIGNATURE_KEY=your_square_webhook_signature_key
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ENVIRONMENT=sandbox
\`\`\`

### Database Configuration
\`\`\`
eventrsvp_POSTGRES_URL=your_postgres_url
eventrsvp_PRISMA_DATABASE_URL=your_prisma_database_url
eventrsvp_DATABASE_URL=your_database_url
\`\`\`

## Auth0 Setup

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new application (Regular Web Application)
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Enable Google social connection in Auth0 dashboard
5. Copy your domain, client ID, and client secret to your environment variables

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This app is optimized for deployment on Vercel. Make sure to add all environment variables in your Vercel project settings.
