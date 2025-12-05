import { Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  FolderOpen, 
  Play, 
  Box, 
  Brain,
  TestTube,
  Sun,
  Moon
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Datasets from './pages/Datasets';
import Training from './pages/Training';
import Models from './pages/Models';
import Testing from './pages/Testing';

export const WebSocketContext = createContext(null);
export const TrainingContext = createContext(null);
export const ThemeContext = createContext(null);

function App() {
  const [ws, setWs] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ml-studio-theme') || 'dark';
  });
  const [trainingStatus, setTrainingStatus] = useState({ status: 'idle' });
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [trainingMetrics, setTrainingMetrics] = useState({
    loss: [],
    accuracy: [],
    valLoss: [],
    valAccuracy: [],
    currentEpoch: 0,
    totalEpochs: 0,
    currentBatch: 0,
    stepsPerEpoch: 0,
    batchProgressPercent: 0
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ml-studio-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setWs(socket);
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Debug: log incoming websocket messages for visibility during training
        console.debug('[WS] incoming:', data);
        handleWebSocketMessage(data);
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 3000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'training_started':
        setTrainingStatus({ status: 'running', runId: data.runId, modelId: data.modelId });
        setTrainingLogs([]);
        setTrainingMetrics({
          loss: [],
          accuracy: [],
          valLoss: [],
          valAccuracy: [],
          currentEpoch: 0,
          totalEpochs: data.total_epochs || 0,
          currentBatch: 0,
          stepsPerEpoch: 0,
          batchProgressPercent: 0
        });
        break;
      case 'training_batch':
        // batch events are frequent; map them into simple live progress fields
        setTrainingMetrics(prev => {
          const steps = data.steps_per_epoch || data.stepsPerEpoch || prev.stepsPerEpoch || 0;
          const currentBatch = data.batch || data.batch_index || 0;
          const percent = steps > 0 ? Math.min(100, Math.round((currentBatch / steps) * 100)) : 0;
          return {
            ...prev,
            currentEpoch: (data.epoch || data.epoch_index) || prev.currentEpoch,
            currentBatch,
            stepsPerEpoch: steps,
            batchProgressPercent: percent
          };
        });
        // optionally append batch-level metrics into arrays if present
        if (typeof data.loss === 'number' || typeof data.accuracy === 'number') {
          setTrainingMetrics(prev => ({
            ...prev,
            loss: typeof data.loss === 'number' ? [...prev.loss, data.loss] : prev.loss,
            accuracy: typeof data.accuracy === 'number' ? [...prev.accuracy, data.accuracy] : prev.accuracy
          }));
        }
        break;
      case 'training_progress':
        setTrainingMetrics(prev => ({
          ...prev,
          loss: [...prev.loss, data.loss],
          accuracy: [...prev.accuracy, data.accuracy],
          valLoss: [...prev.valLoss, data.val_loss],
          valAccuracy: [...prev.valAccuracy, data.val_accuracy],
          currentEpoch: data.epoch,
          totalEpochs: data.total_epochs
        }));
        break;
      case 'training_log':
        setTrainingLogs(prev => [...prev, { 
          message: data.message, 
          level: data.level || 'info',
          timestamp: new Date().toISOString()
        }]);
        break;
      case 'training_completed':
        setTrainingStatus({ 
          status: data.exitCode === 0 ? 'completed' : 'failed',
          runId: data.runId,
          modelId: data.modelId
        });
        break;
      case 'training_stopped':
        setTrainingStatus({ status: 'stopped', runId: data.runId });
        break;
      case 'training_status':
        if (data.status === 'running') {
          setTrainingStatus({ status: 'running', runId: data.runId, modelId: data.modelId });
        }
        break;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <WebSocketContext.Provider value={ws}>
        <TrainingContext.Provider value={{ 
          trainingStatus, 
          setTrainingStatus, 
          trainingLogs, 
          setTrainingLogs,
          trainingMetrics,
          setTrainingMetrics
        }}>
          <div className="app-container">
            <aside className="sidebar">
              <div className="sidebar-header">
                <h1>
                  <Brain size={24} />
                  ML Studio
                </h1>
                <span>Construction Material Detection</span>
              </div>
              
              <nav className="sidebar-nav">
                <div className="nav-section">
                  <div className="nav-section-title">Overview</div>
                  <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    Dashboard
                  </NavLink>
                </div>
                
                <div className="nav-section">
                  <div className="nav-section-title">Data Management</div>
                  <NavLink to="/classes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FolderOpen size={20} />
                    Material Classes
                  </NavLink>
                  <NavLink to="/datasets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Database size={20} />
                    Dataset Manager
                  </NavLink>
                </div>
                
                <div className="nav-section">
                  <div className="nav-section-title">Model Training</div>
                  <NavLink to="/training" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Play size={20} />
                    Training
                  </NavLink>
                  <NavLink to="/models" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Box size={20} />
                    Models
                  </NavLink>
                  <NavLink to="/testing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <TestTube size={20} />
                    Model Testing
                  </NavLink>
                </div>
              </nav>
              
              <div className="sidebar-footer">
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </aside>
            
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/training" element={<Training />} />
                <Route path="/models" element={<Models />} />
                <Route path="/testing" element={<Testing />} />
              </Routes>
            </main>
          </div>
        </TrainingContext.Provider>
      </WebSocketContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
