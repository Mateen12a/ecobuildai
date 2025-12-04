# EcoBuild AI - Smart Material Scanner

## Overview

EcoBuild AI is a comprehensive web application for construction material analysis and carbon footprint tracking. The platform uses machine learning to identify construction materials from images and provides detailed environmental impact data, alternative recommendations, and project management capabilities. The system supports both authenticated users and guest users with limited scanning capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and development server.

**UI Framework**: Shadcn/ui components (based on Radix UI primitives) with Tailwind CSS v4 for styling. The design system uses CSS custom properties for theming with support for light/dark modes.

**Routing**: Wouter for lightweight client-side routing with protected routes that redirect unauthenticated users to the login page.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Local state managed with React hooks. Authentication state managed through a React Context (AuthContext) that handles user data, login/logout, and profile updates.

**Animation**: Framer Motion for page transitions and interactive animations throughout the UI.

**Charts**: Recharts library for data visualization (carbon footprint comparisons, project analytics).

**File Structure**: 
- `/client/src/pages` - Page components for different routes
- `/client/src/components` - Reusable UI components
- `/client/src/lib` - Utility functions, API client, auth context
- `/client/src/hooks` - Custom React hooks

### Backend Architecture

**Runtime**: Node.js with Express.js framework running on TypeScript (compiled with esbuild for production).

**API Design**: RESTful API with route modules organized by feature (auth, projects, materials, scans, reports, models). All API routes are prefixed with `/api`.

**Authentication**: JWT-based authentication with bcrypt for password hashing. Tokens stored in localStorage on client-side and sent via Authorization header. Auth middleware validates tokens and attaches user data to requests. Optional auth middleware supports guest user scanning.

**File Uploads**: Multer middleware for handling image uploads with file size limits (10MB) and type validation (JPEG, PNG, WebP). Images stored in `/uploads/scans` and `/uploads/avatars` directories.

**Static Files**: Express static middleware serves uploaded files and the built frontend from `/dist/public`.

**Development Mode**: Custom Vite development server integration with HMR (Hot Module Replacement) over WebSocket connection at `/vite-hmr`.

**Bundling Strategy**: Server dependencies are selectively bundled (allowlist) to reduce filesystem syscalls and improve cold start times. External packages not in the allowlist are marked as external and loaded from node_modules.

### Data Storage

**Database**: MongoDB Atlas with Mongoose ODM for data modeling and queries. Connection string stored in environment variable `MONGODB_URI`.

**Schema Design**:
- `User` - User accounts with authentication, profile data, preferences, appearance settings, privacy controls, and subscription information
- `Project` - Construction projects with materials tracking, carbon footprint calculations, sustainability scores, and team collaboration
- `Scan` - Material scan history with image paths, AI predictions, confidence scores, material properties, and guest/user association
- `Report` - Generated reports for projects including carbon analysis, recommendations, and chart data
- `MLModel` - Machine learning model metadata including version, accuracy metrics, active status, training configuration, and model file references
- `MaterialImage` - Training images for ML models with material classifications, embeddings, and segmentation data (used by MLStudio)
- `TrainedModel` - ML training session records with logs, metrics, and model artifacts (used by MLStudio)
- `CustomMaterial` - User-defined custom materials extending the ICE database

**Material Database**: ICE (Inventory of Carbon and Energy) database with 15+ predefined construction materials including embodied energy (MJ/kg), embodied carbon (kgCO2/kg), density, and alternative recommendations.

### Machine Learning Integration

**ML Training Studio**: Separate MLStudio application (`/MLStudio-main`) for training custom material recognition models:
- Python worker (`/worker/train.py`) using TensorFlow/Keras with MobileNetV2 transfer learning
- Real-time training progress via WebSocket
- Model versioning and activation system
- Training metrics tracking (accuracy, loss, confusion matrix)

**Model Inference**: 
- Python prediction script (`/worker/predict.py`) spawned as child process for model inference
- Supports multiple model formats and architectures
- Falls back to simulation mode if no trained model is available
- Model status endpoint checks for active model availability

**Model Management**: 
- Active model selection and versioning
- Model activation/deactivation with automatic fallback
- Performance metrics tracking (accuracy, precision, recall, F1 score)
- Model sync between MLStudio and EcoBuild systems

### Key Architectural Decisions

**Guest User Support**: System allows limited material scanning without authentication to reduce friction for new users. Guest scans are tracked with scan limits (3 free scans) and prompt for registration after limit is reached.

**Simulation Mode**: When no trained ML model is available, the system operates in simulation mode, returning predefined results to maintain user experience while development continues.

**Dual Application Structure**: Separate MLStudio application for ML training workflow isolation, allowing data scientists to train models independently from the main application.

**MongoDB for Flexibility**: MongoDB chosen over PostgreSQL (despite Drizzle config) for flexible schema evolution as ML features and material properties expand.

**Image Processing Pipeline**: Multer for upload handling, Sharp for image optimization and resizing to standard dimensions (224x224) for ML model input.

**Carbon Calculation Engine**: Server-side calculations for total carbon footprint, embodied energy, and sustainability scoring based on project materials and quantities.

## External Dependencies

**Database**: MongoDB Atlas (cloud-hosted) - Connection managed via `MONGODB_URI` environment variable

**Machine Learning**: 
- TensorFlow 2.10.0 for model training and inference
- Python 3.x runtime for ML worker processes
- NumPy, Pillow, scikit-learn for data preprocessing

**Authentication**: 
- JWT (jsonwebtoken) for token generation and verification
- bcryptjs for password hashing

**File Storage**: 
- Local filesystem storage for uploaded images and trained models
- Multer for multipart/form-data handling
- Sharp for image processing and optimization

**Third-Party Services** (configured but not all actively used):
- Google OAuth (client-side, backend not fully implemented)
- Stripe (referenced for subscription management, not implemented)
- Nodemailer (for email notifications, not actively used)

**Development Tools**:
- Replit-specific plugins for development environment
- Vite plugins for dev banner, error overlay, and cartographer

**UI Dependencies**:
- Radix UI primitives for accessible components
- Lucide React for icons
- Recharts for data visualization
- Framer Motion for animations

## Recent Changes (December 2025)

**Authentication Fix**: Updated `queryClient.ts` to properly attach JWT tokens from localStorage to all API requests. This fixed the "Failed to load scan history" error that users were experiencing.

**ML Feature Separation**: Simplified the ML Admin page (now renamed to "Models") to focus only on model viewing and activation. Training, Testing, and Sync functionality are now exclusively in the MLStudio application, maintaining clear separation of concerns between:
- EcoBuild (main app): Production model management and activation
- MLStudio-main: ML training, testing, and model syncing

**Scan History Data Fix**: Updated `scan-history.tsx` to correctly handle the API response structure with nested `prediction` and `material` objects, including defensive null checks for robust error handling.

**MLStudio Sync to EcoBuild** (December 4, 2025): Added model sync functionality to MLStudio:
- Added POST `/api/models/:id/sync` endpoint to MLStudio server that writes trained models directly to EcoBuild's MongoDB `mlmodels` collection
- Added GET `/api/models/:id/sync-status` endpoint to check if a model has been synced and if it's active in EcoBuild
- Added "Sync to EcoBuild" button in MLStudio Models page UI with sync status indicators
- Models can be activated during sync or activated later from EcoBuild's Models page
- Both applications share the same MongoDB database (Construction_test) for seamless integration