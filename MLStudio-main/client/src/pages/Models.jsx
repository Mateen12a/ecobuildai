import { useState, useEffect } from 'react';
import { 
  Box, 
  CheckCircle, 
  Trash2,
  Star,
  Clock,
  Layers,
  Target,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Upload,
  ExternalLink,
  Cloud
} from 'lucide-react';

function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [syncing, setSyncing] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data);
      
      for (const model of data) {
        if (model.status === 'completed') {
          fetchSyncStatus(model.id);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async (modelId) => {
    try {
      const response = await fetch(`/api/models/${modelId}/sync-status`);
      const data = await response.json();
      setSyncStatus(prev => ({ ...prev, [modelId]: data }));
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const syncToEcoBuild = async (modelId) => {
    if (!confirm('Sync this model to EcoBuild? This will make it available for material detection in the main app.')) {
      return;
    }

    setSyncing(modelId);
    try {
      const response = await fetch(`/api/models/${modelId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: true })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Model synced successfully to EcoBuild!\n\nVersion: ${data.version}\nStatus: ${data.isActive ? 'Active' : 'Ready'}`);
        fetchSyncStatus(modelId);
      } else {
        alert(data.error || 'Failed to sync model');
      }
    } catch (error) {
      console.error('Error syncing model:', error);
      alert('Failed to sync model to EcoBuild');
    } finally {
      setSyncing(null);
    }
  };

  const activateModel = async (modelId) => {
    try {
      const response = await fetch(`/api/models/${modelId}/activate`, {
        method: 'POST'
      });

      if (response.ok) {
        setModels(models.map(m => ({
          ...m,
          isActive: m.id === modelId
        })));
      }
    } catch (error) {
      console.error('Error activating model:', error);
    }
  };

  const deleteModel = async (modelId, isActive) => {
    const message = isActive 
      ? 'This is the active model. Deleting it will activate the next best model. Continue?'
      : 'Are you sure you want to delete this model? This action cannot be undone.';
    
    if (!confirm(message)) return;

    setDeleting(modelId);
    try {
      const response = await fetch(`/api/models/${modelId}?force=true`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchModels();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    } finally {
      setDeleting(null);
    }
  };

  const activeModel = models.find(m => m.isActive);
  const completedModels = models.filter(m => m.status === 'completed');

  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          <RefreshCw size={48} className="spinning" />
          <h3>Loading models...</h3>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h2>Model Management</h2>
            <p>View, compare, and manage trained material detection models</p>
          </div>
          <button className="btn btn-outline" onClick={fetchModels}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {activeModel && (
        <div className="card" style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Star size={24} color="#10b981" fill="#10b981" />
              <div>
                <h3 className="card-title">Active Model - Ready for Deployment</h3>
                <p className="text-muted text-sm">This model will be used for predictions in your carbon footprint app</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#10b981' }}>
                {activeModel.metrics?.valAccuracy ? 
                  `${(activeModel.metrics.valAccuracy * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="metric-label">Validation Accuracy</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#3b82f6' }}>
                {activeModel.metrics?.valLoss?.toFixed(4) || 'N/A'}
              </div>
              <div className="metric-label">Validation Loss</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#8b5cf6' }}>
                {activeModel.classes?.length || 0}
              </div>
              <div className="metric-label">Material Classes</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#f97316' }}>
                {activeModel.samplesUsed || 'N/A'}
              </div>
              <div className="metric-label">Training Samples</div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {activeModel.classes?.map(cls => (
              <span key={cls} className="badge badge-success" style={{ fontSize: '12px' }}>
                {cls.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          
          <div className="text-muted text-sm mt-4">
            <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Trained: {new Date(activeModel.createdAt).toLocaleString()}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Models ({models.length})</h3>
        </div>

        {models.length === 0 ? (
          <div className="empty-state">
            <Box size={64} />
            <h3>No trained models yet</h3>
            <p>Train a model from the Training page to see it here</p>
            <a href="/training" className="btn btn-primary mt-4">
              Go to Training
            </a>
          </div>
        ) : (
          <div className="models-list">
            {models.map(model => (
              <div 
                key={model.id} 
                className={`model-card ${model.isActive ? 'active' : ''}`}
              >
                <div className="model-info">
                  <h4>
                    {model.name}
                    {model.isActive && (
                      <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                    {model.status === 'training' && (
                      <span className="badge badge-info" style={{ marginLeft: '8px' }}>
                        Training...
                      </span>
                    )}
                    {model.status === 'failed' && (
                      <span className="badge badge-danger" style={{ marginLeft: '8px' }}>
                        Failed
                      </span>
                    )}
                    {model.status === 'stopped' && (
                      <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                        Stopped
                      </span>
                    )}
                  </h4>
                  <div className="model-meta">
                    <span>
                      <Layers size={14} style={{ marginRight: '4px' }} />
                      {model.classes?.length || 0} classes
                    </span>
                    <span>
                      <TrendingUp size={14} style={{ marginRight: '4px' }} />
                      Accuracy: {model.metrics?.valAccuracy ? 
                        `${(model.metrics.valAccuracy * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                    <span>
                      Loss: {model.metrics?.valLoss?.toFixed(4) || 'N/A'}
                    </span>
                    <span>
                      <Clock size={14} style={{ marginRight: '4px' }} />
                      {new Date(model.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {model.classes && model.classes.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {model.classes.slice(0, 5).map(cls => (
                        <span key={cls} className="badge badge-info" style={{ fontSize: '11px' }}>
                          {cls.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {model.classes.length > 5 && (
                        <span className="badge badge-info" style={{ fontSize: '11px' }}>
                          +{model.classes.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {syncStatus[model.id]?.synced && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '6px 10px', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}>
                      <ExternalLink size={12} color="#3b82f6" />
                      <span style={{ color: '#3b82f6' }}>
                        Synced to EcoBuild ({syncStatus[model.id].version})
                        {syncStatus[model.id].isActive && (
                          <span className="badge badge-success" style={{ marginLeft: '6px', fontSize: '10px' }}>
                            Active in EcoBuild
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="model-actions">
                  {model.status === 'completed' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => syncToEcoBuild(model.id)}
                      disabled={syncing === model.id}
                      title={syncStatus[model.id]?.synced ? 'Re-sync to EcoBuild' : 'Sync to EcoBuild'}
                      data-testid={`button-sync-model-${model.id}`}
                    >
                      {syncing === model.id ? (
                        <RefreshCw size={14} className="spinning" />
                      ) : (
                        <Cloud size={14} />
                      )}
                      {syncStatus[model.id]?.synced ? 'Re-sync' : 'Sync to EcoBuild'}
                    </button>
                  )}
                  {!model.isActive && model.status === 'completed' && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => activateModel(model.id)}
                      data-testid={`button-activate-model-${model.id}`}
                    >
                      <CheckCircle size={14} />
                      Activate
                    </button>
                  )}
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteModel(model.id, model.isActive)}
                    disabled={deleting === model.id}
                    data-testid={`button-delete-model-${model.id}`}
                  >
                    {deleting === model.id ? (
                      <RefreshCw size={14} className="spinning" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completedModels.length >= 2 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            <Target size={20} style={{ display: 'inline', marginRight: '8px' }} />
            Model Comparison
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Model</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>Val Accuracy</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>Val Loss</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>Train Accuracy</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>Samples Used</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedModels.map(model => (
                  <tr key={model.id} style={{ borderBottom: '1px solid var(--bg-primary)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{model.name}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                      {model.metrics?.valAccuracy ? 
                        `${(model.metrics.valAccuracy * 100).toFixed(2)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#f97316' }}>
                      {model.metrics?.valLoss?.toFixed(4) || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#3b82f6' }}>
                      {model.metrics?.accuracy ? 
                        `${(model.metrics.accuracy * 100).toFixed(2)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#8b5cf6' }}>
                      {model.samplesUsed || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {model.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-info">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px', background: 'var(--bg-primary)' }}>
        <h3 className="card-title" style={{ marginBottom: '12px' }}>Deployment Instructions</h3>
        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          The active model can be accessed via the <code style={{ 
            background: 'var(--bg-secondary)', 
            padding: '2px 8px', 
            borderRadius: '4px',
            color: '#10b981'
          }}>/api/models/active</code> endpoint. 
          Use this to load the model configuration and labels for predictions in your carbon footprint analysis application.
          Models can be tested on the <a href="/testing" style={{ color: '#3b82f6' }}>Model Testing</a> page.
        </p>
      </div>
    </div>
  );
}

export default Models;
