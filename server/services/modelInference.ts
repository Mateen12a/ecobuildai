import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

interface PredictionResult {
  predictions: Array<{
    class: string;
    className: string;
    confidence: number;
  }>;
  topPrediction: {
    class: string;
    className: string;
    confidence: number;
  };
  modelUsed: string;
  isSimulation: boolean;
}

interface ModelInfo {
  modelPath: string;
  labelsPath: string;
  classes: string[];
  classIndices: Record<string, string>;
  inputShape: number[];
}

const MATERIAL_NAMES: Record<string, string> = {
  'bricks': 'Bricks (common)',
  'concrete': 'Concrete (1:1.5:3)',
  'aggregate': 'Aggregate',
  'aerated_block': 'Aerated block',
  'concrete_block': 'Concrete block',
  'limestone_block': 'Limestone block',
  'rammed_earth': 'Rammed earth',
  'timber': 'Timber (general)',
  'steel': 'Steel (general)',
  'glass': 'Glass (float)',
  'aluminum': 'Aluminum (general)',
  'insulation_mineral_wool': 'Mineral wool insulation',
  'insulation_cellulose': 'Cellulose insulation',
  'plasterboard': 'Plasterboard',
  'ceramic_tiles': 'Ceramic tiles'
};

export async function predictWithModel(
  imagePath: string, 
  modelInfo: ModelInfo
): Promise<PredictionResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '..', '..', 'MLStudio-main', 'worker', 'predict.py');
    
    if (!fs.existsSync(pythonScript)) {
      console.log('Python inference script not found, using simulation');
      resolve(simulatePrediction());
      return;
    }

    if (!fs.existsSync(modelInfo.modelPath)) {
      console.log('Model file not found, using simulation');
      resolve(simulatePrediction());
      return;
    }

    const pythonProcess = spawn('python3', [
      pythonScript,
      '--image', imagePath,
      '--model', modelInfo.modelPath,
      '--labels', modelInfo.labelsPath
    ]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          const predictions = result.predictions.map((p: any) => ({
            class: p.class,
            className: MATERIAL_NAMES[p.class] || p.class,
            confidence: p.confidence
          }));
          
          predictions.sort((a: any, b: any) => b.confidence - a.confidence);
          
          resolve({
            predictions: predictions.slice(0, 5),
            topPrediction: predictions[0],
            modelUsed: result.model || 'MLStudio Model',
            isSimulation: false
          });
        } catch (e) {
          console.error('Error parsing prediction result:', e);
          resolve(simulatePrediction());
        }
      } else {
        console.error('Python inference failed:', stderr);
        resolve(simulatePrediction());
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      resolve(simulatePrediction());
    });

    setTimeout(() => {
      pythonProcess.kill();
      console.log('Prediction timeout, using simulation');
      resolve(simulatePrediction());
    }, 30000);
  });
}

function simulatePrediction(): PredictionResult {
  const materialKeys = Object.keys(MATERIAL_NAMES);
  const randomIndex = Math.floor(Math.random() * materialKeys.length);
  const predictedKey = materialKeys[randomIndex];
  
  const predictions = materialKeys.map((key) => {
    let confidence = Math.random() * 0.3 + 0.05;
    if (key === predictedKey) {
      confidence = Math.random() * 0.25 + 0.70;
    }
    return {
      class: key,
      className: MATERIAL_NAMES[key],
      confidence
    };
  });

  const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0);
  predictions.forEach(p => p.confidence = p.confidence / totalConfidence);
  predictions.sort((a, b) => b.confidence - a.confidence);

  return {
    predictions: predictions.slice(0, 5),
    topPrediction: predictions[0],
    modelUsed: 'EcoBuild Simulation',
    isSimulation: true
  };
}

export async function checkModelAvailability(modelPath: string): Promise<boolean> {
  try {
    return fs.existsSync(modelPath);
  } catch {
    return false;
  }
}
