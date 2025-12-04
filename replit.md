# EcoBuild AI - Smart Material Scanner

## Overview

EcoBuild AI is a comprehensive web application for construction material analysis and carbon footprint tracking. The platform uses machine learning to identify construction materials from images and provides detailed sustainability metrics, helping architects and engineers make environmentally conscious material choices. The application features material scanning, project management, sustainability reporting, and a comprehensive materials library based on the ICE (Inventory of Carbon and Energy) database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and development server.

**UI Framework**: Shadcn/ui components (based on Radix UI primitives) with Tailwind CSS v4 for styling. The design system uses CSS custom properties for theming with support for light/dark modes. Two primary fonts are used: Inter for body text and Oswald for display headings.

**Routing**: Wouter for lightweight client-side routing with protected routes that redirect unauthenticated users to the login page.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Local state managed with React hooks. Authentication state managed through a React Context provider.

**Animation**: Framer Motion for page transitions and interactive animations throughout the UI.

**Charts**: Recharts library for data visualization (carbon footprint comparisons, project analytics).

**File Structure**: 
- `/client/src/pages` - Page components for different routes
- `/client/src/components` - Reusable UI components
- `/client/src/lib` - Utility functions, API client, auth context
- `/client/src/hooks` - Custom React hooks

### Backend Architecture

**Runtime**: Node.js with Express.js framework running on TypeScript (compiled with esbuild for production).

**API Design**: RESTful API with route modules organized by feature (auth, projects, materials, scans, reports). All API routes are prefixed with `/api`.

**Authentication**: JWT-based authentication with bcrypt for password hashing. Tokens stored in localStorage on client-side and sent via Authorization header. Auth middleware validates tokens and attaches user data to requests.

**File Uploads**: Multer middleware for handling image uploads with file size limits (10MB) and type validation (JPEG, PNG, WebP). Images stored in `/uploads/scans` directory.

**Static Files**: Express static middleware serves uploaded files and the built frontend from `/dist/public`.

**Development Mode**: Custom Vite development server integration with HMR (Hot Module Replacement) over WebSocket connection at `/vite-hmr`.

**Bundling Strategy**: Server dependencies are selectively bundled (allowlist) to reduce filesystem syscalls and improve cold start times. External packages not in the allowlist are marked as external during esbuild compilation.

### Data Storage

**Primary Database**: MongoDB Atlas (cloud-hosted) using Mongoose ODM for schema validation and querying.

**Connection**: Connection string stored in `MONGODB_URI` environment variable. Single connection with automatic reconnection handling.

**Schemas**:
- **User**: Authentication and profile data (email, password hash, name, company, stats)
- **Project**: Construction projects with materials, location, status, progress tracking
- **Scan**: Material scan results with predictions, confidence scores, image paths
- **Report**: Generated sustainability reports with metrics and recommendations
- **MaterialImage** (ML Studio): Training images stored with binary data in GridFS-like Buffer fields
- **TrainedModel** (ML Studio): ML model metadata, training history, and serialized model data
- **CustomMaterial** (ML Studio): User-defined material classes with embodied energy/carbon data

**Indexing**: Compound indexes on userId and timestamps for efficient query performance.

**In-Memory Storage**: Fallback memory storage implementation (`MemStorage` class) for user data when database is unavailable, though not actively used in production.

### External Dependencies

**Database**: MongoDB Atlas cluster accessed via connection string with credentials embedded. Database name: `Construction_test`.

**ML Training Service** (MLStudio Integration): Python-based training worker using TensorFlow 2.20/Keras with EfficientNetB0 architecture. Features:
- `/MLStudio-main/worker/train.py` - Main training script with 3-phase progressive unfreezing, class-weighted learning, and comprehensive augmentation
- `/MLStudio-main/worker/add_training_images.py` - Data management tool for adding/deduplicating training images
- `/MLStudio-main/worker/sync_model_to_ecobuild.py` - Model synchronization tool to deploy trained models to EcoBuild
- `/MLStudio-main/worker/predict.py` - Inference script used by EcoBuild for real predictions
- `/server/services/modelInference.ts` - Node.js service that bridges to Python for ML predictions

**Material Data**: ICE (Inventory of Carbon and Energy) database materials hardcoded in `/server/routes/materials.ts` and `/MLStudio-main/server/config/materials.js`. Contains 15+ construction materials with embodied energy (MJ/kg), embodied carbon (kgCO2/kg), and density values.

**Third-Party Services**:
- Replit-specific development tools (vite plugins for cartographer, dev banner, runtime error modal)
- Google Fonts (Inter and Oswald families)
- Meta image plugin for dynamic OpenGraph image URL generation based on Replit deployment domain

**Image Processing**: Sharp library for server-side image resizing and optimization (224x224 for ML training).

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string (Drizzle config, though MongoDB is actually used)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token signing (defaults to hardcoded value if not set)
- `NODE_ENV` - Environment mode (development/production)
- `REPL_ID` - Replit-specific identifier for development tooling

**Build Process**:
1. Frontend: Vite builds React app to `/dist/public`
2. Backend: esbuild bundles server code to `/dist/index.js` as ESM with selective external dependencies
3. Production start: `node dist/index.js` serves both API and static frontend

**CORS**: Enabled for cross-origin requests during development.

**WebSocket**: Used for ML training progress updates in the MLStudio integration (separate server on port 3001).

**Session Management**: JWT tokens with 7-day expiration. No server-side session storage—tokens are stateless and validated on each request.

## Recent Enhancements (December 2025)

### Dashboard Improvements
- **Clickable Stats Cards**: Total Scans stat card on dashboard now navigates to /history for quick access to scan history

### ML Admin Interface (/ml-admin)
A new admin interface for managing ML models with the following features:
- **Model Training**: Configure and initiate training with adjustable epochs, batch size, learning rate, and validation split
- **Local Models List**: View all locally trained models with accuracy, class count, and sample counts
- **Model Syncing**: One-click sync to deploy models from MLStudio to EcoBuild
- **Model Testing**: Test models with image URLs before deployment
- **Training Progress**: Real-time training status display

### Achieving 90%+ Model Accuracy
The training script (`MLStudio-main/worker/train.py`) is optimized for high accuracy:
1. **EfficientNetB0 Architecture**: Transfer learning with ImageNet pretrained weights
2. **3-Phase Progressive Training**: Gradual unfreezing for optimal feature learning
3. **Automatic Data Augmentation**: 3-5x dataset expansion with rotation, flip, brightness, zoom
4. **Class Balancing**: Automatic class weighting for imbalanced datasets
5. **Early Stopping & LR Scheduling**: Prevents overfitting with patience-based stopping

Expected accuracy by dataset size:
- 30+ samples/class: 85-90%
- 50+ samples/class: 90-95%
- 100+ samples/class: 95%+

### Navigation Updates
- ML Admin link added to desktop navigation header
- ML Admin link added to mobile sidebar menu
- All authenticated pages accessible via navigation