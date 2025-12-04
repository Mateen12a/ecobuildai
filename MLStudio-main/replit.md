# AI Material Management Studio

## Overview
A comprehensive ML training studio for construction material detection, designed to help identify ICE (Inventory of Carbon and Energy) construction materials from images for carbon footprint analysis.

## Project Structure
```
/
├── server/           # Express.js backend with MongoDB
│   ├── server.js     # Main API server (port 3001)
│   ├── models/       # Mongoose schemas
│   │   ├── MaterialImage.js
│   │   ├── TrainedModel.js
│   │   └── CustomMaterial.js
│   └── config/
│       └── materials.js  # ICE database materials
├── client/           # React frontend with Vite
│   ├── src/
│   │   ├── App.jsx   # Main app with routing and theme
│   │   ├── pages/    # Dashboard, Classes, Training, Models, Testing
│   │   └── index.css # Theme-aware styling
│   └── index.html
├── worker/           # Python ML training worker
│   ├── train.py      # MobileNetV2 transfer learning
│   └── requirements.txt
├── data/             # Generated data storage
│   ├── models/       # Trained model files
│   ├── uploads/      # Uploaded images
│   └── temp/         # Temporary files
└── package.json      # Root scripts
```

## Key Features

### Material Classes
- **ICE Database Materials**: 15 pre-defined construction materials with embodied energy/carbon data
- **Custom Classes**: User-defined material classes with editable properties
- **Material Alternatives**: Lower carbon alternative suggestions

### Model Training
- Transfer learning using MobileNetV2
- Real-time training progress via WebSocket
- Configurable epochs, batch size, learning rate
- Validation split and accuracy metrics

### Model Management
- View all trained models
- Activate/deactivate models
- Delete any model (including active ones with auto-fallback)
- Compare model performance

### Model Testing
- Upload test images for prediction
- View confidence scores per class
- Material property display (energy, carbon, density)
- Alternative material suggestions

### UI Features
- Light/Dark theme toggle with localStorage persistence
- Real-time WebSocket updates
- Responsive design

## Configuration

### MongoDB Connection
The server uses environment variable with fallback:
```javascript
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://...fallback...";
```

**Security Note**: For production deployment, always set `MONGO_URI` in environment secrets. The hardcoded fallback is for development convenience only.

### Running the Application
```bash
npm run dev  # Starts both server (port 3001) and client (port 5000)
```

## API Endpoints

### Classes
- `GET /api/classes` - Get all material classes (ICE + custom)
- `POST /api/classes` - Create custom class
- `PUT /api/classes/:id` - Update custom class
- `DELETE /api/classes/:id` - Delete custom class

### Models
- `GET /api/models` - List all models
- `GET /api/models/active` - Get active model
- `POST /api/models/:id/activate` - Activate model
- `DELETE /api/models/:id` - Delete model

### Training
- `POST /api/training/start` - Start training
- `POST /api/training/stop` - Stop training
- `GET /api/training/status` - Training status

### Prediction
- `POST /api/predict` - Run prediction on image

## Recent Changes
- December 2024: Reorganized folder structure (server/, client/, worker/, data/)
- December 2024: Added MongoDB URI fallback support
- December 2024: Extended ICE materials from 8 to 15 classes
- December 2024: Added custom material class management
- December 2024: Added model testing page with predictions
- December 2024: Improved model deletion (can delete active models)
- December 2024: Added light/dark theme toggle
