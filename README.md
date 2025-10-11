# Gygg Platform Frontend

Frontend application for the Gygg gig economy platform built with React, Vite, and Tailwind CSS.

## Project Structure

```
gygg-platform-frontend/
├── src/
│   ├── components/         # React components
│   │   ├── common/         # Reusable UI components
│   │   ├── features/       # Feature-specific components
│   │   └── layouts/        # Layout components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React context providers
│   ├── api/                # API client and requests
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration
│   ├── styles/             # Global styles
│   └── constants/          # Constants and enums
├── public/                 # Static assets
├── tests/                  # Test files
└── ...
```

## Features

- Modern React application with Vite build system
- Real-time chat functionality
- Stripe payment integration
- User profiles and management
- Gig posting and search
- Review and rating system
- Responsive design with mobile support

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables if needed:
   ```bash
   # If environment variables are required, create .env file
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests with Vitest
- `npm run lint` - Lint the codebase
- `npm run format` - Format the codebase with Prettier

## Development

The application uses:
- React 19 with functional components and hooks
- Vite for fast development and builds
- Tailwind CSS for styling
- React Router for navigation
- Ant Design and Flowbite React for UI components
- Stripe for payment processing
- Socket.IO for real-time communication