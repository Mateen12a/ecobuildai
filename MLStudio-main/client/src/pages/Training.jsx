import { useState, useEffect, useContext, useRef } from 'react';
import { 
  Play, 
  Square, 
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrainingContext } from '../App';

function Training() {
  const { 
    trainingStatus, 
    setTrainingStatus, 
    trainingLogs, 
    setTrainingLogs,
    trainingMetrics 
  } = useContext(TrainingContext);
  
  const [stats, setStats] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    epochs: 15,
    batchSize: 16,
    learningRate: 0.0001,
    validationSplit: 0.2,
    enableSegmentation: false
  });
  const [trainingHistory, setTrainingHistory] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchStats();
    fetchTrainingHistory();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trainingLogs]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dataset/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTrainingHistory = async () => {
    try {
      const response = await fetch('/api/training/history');
      const data = await response.json();
      setTrainingHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const startTraining = async () => {
    try {
      const response = await fetch('/api/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to start training');
        return;
      }

      const data = await response.json();
      setTrainingStatus({ status: 'running', runId: data.runId, modelId: data.modelId });
      setTrainingLogs([]);
      setShowConfig(false);
    } catch (error) {
      console.error('Error starting training:', error);
      alert('Failed to start training');
    }
  };

  const stopTraining = async () => {
    try {
      await fetch('/api/training/stop', { method: 'POST' });
    } catch (error) {
      console.error('Error stopping training:', error);
    }
  };

  const chartData = trainingMetrics.loss.map((loss, index) => ({
    epoch: index + 1,
    loss: loss,
    accuracy: trainingMetrics.accuracy[index],
    valLoss: trainingMetrics.valLoss[index],
    valAccuracy: trainingMetrics.valAccuracy[index]
  }));

  const canTrain = stats && stats.totalClasses >= 2 && stats.totalSamples >= 10;
  const isTraining = trainingStatus.status === 'running';

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h2>Model Training</h2>
            <p>Train your ICE material detection model with MongoDB-stored images</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isTraining && (
              <button 
                className="btn btn-outline"
                onClick={() => setShowConfig(!showConfig)}
              >
                <Settings size={16} />
                Configure
              </button>
            )}
            {isTraining ? (
              <button className="btn btn-danger" onClick={stopTraining}>
                <Square size={16} />
                Stop Training
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={startTraining}
                disabled={!canTrain}
              >
                <Play size={16} />
                Start Training
              </button>
            )}
          </div>
        </div>
      </div>

      {!canTrain && !isTraining && (
        <div className="card" style={{ borderColor: '#f97316', background: 'rgba(249, 115, 22, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={24} color="#f97316" />
            <div>
              <h4 style={{ color: '#f97316', marginBottom: '4px' }}>Cannot start training</h4>
              <p className="text-muted">
                You need at least 2 material classes and 10 total samples in MongoDB.
                Current: {stats?.totalClasses || 0} classes, {stats?.totalSamples || 0} samples
              </p>
            </div>
          </div>
        </div>
      )}

      {showConfig && !isTraining && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Training Configuration</h3>
          <div className="training-config">
            <div className="form-group">
              <label className="form-label">Epochs</label>
              <input
                type="number"
                className="input"
                value={config.epochs}
                onChange={e => setConfig({ ...config, epochs: parseInt(e.target.value) })}
                min={5}
                max={100}
              />
              <small className="text-muted">More epochs = better accuracy (15-30 recommended)</small>
            </div>
            <div className="form-group">
              <label className="form-label">Batch Size</label>
              <input
                type="number"
                className="input"
                value={config.batchSize}
                onChange={e => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                min={8}
                max={64}
              />
              <small className="text-muted">16-32 works well for most datasets</small>
            </div>
            <div className="form-group">
              <label className="form-label">Learning Rate</label>
              <input
                type="number"
                className="input"
                value={config.learningRate}
                onChange={e => setConfig({ ...config, learningRate: parseFloat(e.target.value) })}
                step={0.00001}
                min={0.00001}
                max={0.01}
              />
              <small className="text-muted">0.0001 is a safe default</small>
            </div>
            <div className="form-group">
              <label className="form-label">Validation Split</label>
              <input
                type="number"
                className="input"
                value={config.validationSplit}
                onChange={e => setConfig({ ...config, validationSplit: parseFloat(e.target.value) })}
                step={0.05}
                min={0.1}
                max={0.3}
              />
              <small className="text-muted">20% validation is standard</small>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '16px', background: '#0f172a', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enableSegmentation}
                onChange={e => setConfig({ ...config, enableSegmentation: e.target.checked })}
                style={{ width: '20px', height: '20px' }}
              />
              <div>
                <div style={{ color: '#f8fafc', fontWeight: '500' }}>
                  <Target size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Enable Segmentation Mode
                </div>
                <small className="text-muted">
                  Train model to identify multiple materials in a single image (experimental)
                </small>
              </div>
            </label>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Training Status</h3>
            <div className="status-indicator">
              <span className={`status-dot ${isTraining ? 'running' : 'idle'}`}></span>
              <span style={{ textTransform: 'capitalize' }}>
                {trainingStatus.status}
              </span>
            </div>
          </div>

          {isTraining && (
            <div className="training-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${(trainingMetrics.currentEpoch / trainingMetrics.totalEpochs) * 100}%` 
                  }}
                />
              </div>
              <div className="progress-text">
                <span>Epoch {trainingMetrics.currentEpoch} of {trainingMetrics.totalEpochs}</span>
                <span>{Math.round((trainingMetrics.currentEpoch / trainingMetrics.totalEpochs) * 100)}%</span>
              </div>
            </div>
          )}

          {trainingMetrics.accuracy.length > 0 && (
            <div className="metrics-grid" style={{ marginTop: '16px' }}>
              <div className="metric-box">
                <div className="metric-value" style={{ color: '#10b981' }}>
                  {(trainingMetrics.accuracy[trainingMetrics.accuracy.length - 1] * 100).toFixed(1)}%
                </div>
                <div className="metric-label">Training Accuracy</div>
              </div>
              <div className="metric-box">
                <div className="metric-value" style={{ color: '#8b5cf6' }}>
                  {(trainingMetrics.valAccuracy[trainingMetrics.valAccuracy.length - 1] * 100).toFixed(1)}%
                </div>
                <div className="metric-label">Validation Accuracy</div>
              </div>
              <div className="metric-box">
                <div className="metric-value" style={{ color: '#3b82f6' }}>
                  {trainingMetrics.loss[trainingMetrics.loss.length - 1].toFixed(4)}
                </div>
                <div className="metric-label">Training Loss</div>
              </div>
              <div className="metric-box">
                <div className="metric-value" style={{ color: '#f97316' }}>
                  {trainingMetrics.valLoss[trainingMetrics.valLoss.length - 1].toFixed(4)}
                </div>
                <div className="metric-label">Validation Loss</div>
              </div>
            </div>
          )}

          {!isTraining && trainingMetrics.accuracy.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Zap size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
              <p className="text-muted">
                Ready to train. Configure settings and click "Start Training" to begin.
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Training Logs</h3>
          <div className="logs-container">
            {trainingLogs.length === 0 ? (
              <p className="text-muted">No logs yet. Start training to see output.</p>
            ) : (
              trainingLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`log-entry ${log.level === 'error' ? 'error' : ''}`}
                >
                  <span style={{ color: '#64748b', marginRight: '8px' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {log.message}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Accuracy over Epochs</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="epoch" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => `${(value * 100).toFixed(2)}%`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Training" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valAccuracy" stroke="#8b5cf6" name="Validation" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Loss over Epochs</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="epoch" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => value.toFixed(4)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="loss" stroke="#3b82f6" name="Training" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="valLoss" stroke="#f97316" name="Validation" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>Training History</h3>
        {trainingHistory.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <Clock size={48} />
            <h3>No training history</h3>
            <p>Your completed training runs will appear here</p>
          </div>
        ) : (
          <div className="models-list">
            {trainingHistory.map(run => (
              <div key={run.id} className="model-card">
                <div className="model-info">
                  <h4>
                    Training Run
                    {run.status === 'completed' && (
                      <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                        <CheckCircle size={12} /> Completed
                      </span>
                    )}
                    {run.status === 'failed' && (
                      <span className="badge badge-danger" style={{ marginLeft: '8px' }}>
                        <AlertCircle size={12} /> Failed
                      </span>
                    )}
                    {run.status === 'stopped' && (
                      <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                        <Square size={12} /> Stopped
                      </span>
                    )}
                    {run.status === 'training' && (
                      <span className="badge badge-info" style={{ marginLeft: '8px' }}>
                        <Play size={12} /> Running
                      </span>
                    )}
                  </h4>
                  <div className="model-meta">
                    <span>Started: {new Date(run.startedAt).toLocaleString()}</span>
                    {run.completedAt && (
                      <span>Completed: {new Date(run.completedAt).toLocaleString()}</span>
                    )}
                    <span>Epochs: {run.config?.epochs}</span>
                  </div>
                </div>
                {run.metrics && run.metrics.valAccuracy > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontWeight: 600 }}>
                      {(run.metrics.valAccuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-muted text-sm">Val Accuracy</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Training;
