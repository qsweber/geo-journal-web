# Website Template

A personal website template built with [Next.js](https://nextjs.org/) and configured for static site generation.

## Features

- Built with Next.js 14 App Router
- Static site export (no server required)
- TypeScript support
- Emotion CSS-in-JS for styling
- Responsive design
- **AWS Cognito Authentication** - User registration, login, and email verification

## Authentication

This template includes AWS Cognito integration for user authentication. See [COGNITO_SETUP.md](./COGNITO_SETUP.md) for detailed setup instructions.

### Quick Start for Authentication

1. Deploy infrastructure: `cd infrastructure && pulumi up`
2. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_COGNITO_REGION=us-west-2
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=<your-pool-id>
   NEXT_PUBLIC_COGNITO_CLIENT_ID=<your-client-id>
   ```
3. Run the app: `npm run dev`

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will hot-reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production and exports it as a static site to the `out` folder.\
The site is fully static with all pages pre-rendered at build time.

The build is optimized for the best performance.\
Your app is ready to be deployed!

### `npm start`

Starts the Next.js production server locally.\
Note: For static hosting, deploy the contents of the `out` folder instead.

## Deployment

This site is configured for static export. After running `npm run build`, the static files will be in the `out` directory.

Pulumi manages the AWS infrastructure for the deployment to S3+Cloudfront.

## Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn React, check out the [React documentation](https://reactjs.org/).
