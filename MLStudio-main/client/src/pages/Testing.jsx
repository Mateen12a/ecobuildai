import { useState, useEffect, useRef } from 'react';
import { 
  TestTube, 
  Upload, 
  Image,
  Target,
  TrendingUp,
  Leaf,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Layers,
  Settings2
} from 'lucide-react';

function Testing() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.15);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      const completedModels = data.filter(m => m.status === 'completed');
      setModels(completedModels);
      
      const active = completedModels.find(m => m.isActive);
      if (active) {
        setSelectedModel(active);
      } else if (completedModels.length > 0) {
        setSelectedModel(completedModels[0]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const runPrediction = async () => {
    if (!imageFile || !selectedModel) return;

    setPredicting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('modelId', selectedModel.id);
      formData.append('threshold', threshold.toString());
      formData.append('maxMaterials', '5');

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Prediction failed');
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setPredicting(false);
    }
  };

  const clearTest = () => {
    setImageFile(null);
    setImagePreview(null);
    setPrediction(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        <h2>Model Testing</h2>
        <p>Test your trained models by uploading images and analyzing predictions</p>
      </div>

      {models.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <TestTube size={64} />
            <h3>No trained models available</h3>
            <p>Train a model first to test predictions</p>
            <a href="/training" className="btn btn-primary mt-4">Go to Training</a>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Select Model to Test</h3>
              <button 
                className={`btn ${showSettings ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setShowSettings(!showSettings)}
                style={{ padding: '8px 12px' }}
              >
                <Settings2 size={16} />
                Settings
              </button>
            </div>
            
            {showSettings && (
              <div style={{ 
                padding: '16px', 
                background: 'var(--bg-primary)', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ color: '#f8fafc', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Multi-Material Detection Threshold: {(threshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={threshold * 100}
                    onChange={(e) => setThreshold(parseInt(e.target.value) / 100)}
                    style={{ width: '100%' }}
                  />
                  <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                    Materials with confidence above this threshold will be detected. Lower values detect more materials.
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {models.map(model => (
                <button
                  key={model.id}
                  className={`btn ${selectedModel?.id === model.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedModel(model)}
                >
                  {model.isActive && <CheckCircle size={14} />}
                  {model.name}
                  <span style={{ opacity: 0.7, marginLeft: '8px' }}>
                    ({(model.metrics?.valAccuracy * 100).toFixed(1)}%)
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Upload Test Image</h3>
              
              <div
                className={`upload-zone ${imagePreview ? 'has-image' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Test" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '280px', 
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }} 
                  />
                ) : (
                  <>
                    <Image size={48} className="upload-zone-icon" />
                    <p className="upload-zone-text">
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className="upload-zone-text">
                      JPEG, PNG or WebP images
                    </p>
                  </>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={runPrediction}
                  disabled={!imageFile || predicting}
                  style={{ flex: 1 }}
                >
                  {predicting ? (
                    <>
                      <RefreshCw size={16} className="spinning" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target size={16} />
                      Run Prediction
                    </>
                  )}
                </button>
                {imagePreview && (
                  <button className="btn btn-outline" onClick={clearTest}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>
                <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
                Prediction Results
              </h3>

              {error && (
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              {!prediction && !error && (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <Target size={48} />
                  <h3>No prediction yet</h3>
                  <p>Upload an image and click "Run Prediction"</p>
                </div>
              )}

              {prediction && (
                <div>
                  {prediction.isMultiMaterial && (
                    <div style={{ 
                      padding: '16px', 
                      background: 'rgba(139, 92, 246, 0.15)', 
                      borderRadius: '12px',
                      marginBottom: '16px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <Layers size={20} color="#8b5cf6" />
                        <div style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '16px' }}>
                          Multiple Materials Detected
                        </div>
                      </div>
                      <div className="text-muted text-sm">
                        {prediction.detectedMaterials?.length || 0} materials found above {(threshold * 100).toFixed(0)}% confidence threshold
                      </div>
                    </div>
                  )}

                  {prediction.isMultiMaterial && prediction.detectedMaterials?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={18} />
                        Detected Materials ({prediction.detectedMaterials.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {prediction.detectedMaterials.map((mat, idx) => (
                          <div 
                            key={mat.class}
                            style={{ 
                              padding: '16px',
                              background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '12px',
                              border: `1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                  width: '28px', 
                                  height: '28px', 
                                  borderRadius: '50%', 
                                  background: idx === 0 ? '#10b981' : '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: 'white'
                                }}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '16px' }}>
                                    {(mat.className || mat.class).replace(/_/g, ' ')}
                                  </div>
                                  {idx === 0 && <span className="text-muted text-sm">Primary Material</span>}
                                </div>
                              </div>
                              <div style={{ 
                                color: idx === 0 ? '#10b981' : '#3b82f6',
                                fontWeight: '700',
                                fontSize: '18px'
                              }}>
                                {(mat.confidence * 100).toFixed(1)}%
                              </div>
                            </div>
                            
                            <div style={{ 
                              background: 'var(--bg-primary)', 
                              borderRadius: '6px', 
                              height: '8px', 
                              overflow: 'hidden',
                              marginBottom: '12px'
                            }}>
                              <div style={{ 
                                width: `${mat.confidence * 100}%`,
                                height: '100%',
                                background: idx === 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                borderRadius: '6px'
                              }} />
                            </div>
                            
                            {mat.material && (
                              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Zap size={14} color="#f97316" />
                                  <span className="text-muted text-sm">{mat.material.embodiedEnergy} MJ/kg</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Leaf size={14} color="#10b981" />
                                  <span className="text-muted text-sm">{mat.material.embodiedCarbon} kgCO₂/kg</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!prediction.isMultiMaterial && (
                    <div style={{ 
                      padding: '20px', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <CheckCircle size={24} color="#10b981" />
                        <div>
                          <div style={{ color: '#f8fafc', fontWeight: '600', fontSize: '18px' }}>
                            {prediction.prediction.className.replace(/_/g, ' ')}
                          </div>
                          <div className="text-muted text-sm">Single Material Detected</div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        background: 'var(--bg-primary)', 
                        borderRadius: '8px', 
                        height: '12px', 
                        overflow: 'hidden',
                        marginBottom: '8px'
                      }}>
                        <div style={{ 
                          width: `${prediction.prediction.confidence * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #34d399)',
                          borderRadius: '8px',
                          transition: 'width 0.5s'
                        }} />
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                        {(prediction.prediction.confidence * 100).toFixed(1)}% confidence
                      </div>
                    </div>
                  )}

                  {prediction.material && !prediction.isMultiMaterial && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '12px',
                      marginBottom: '20px'
                    }}>
                      <div className="metric-box">
                        <div style={{ color: '#f97316', fontSize: '18px', fontWeight: '600' }}>
                          <Zap size={16} style={{ display: 'inline', marginRight: '6px' }} />
                          {prediction.material.embodiedEnergy} MJ/kg
                        </div>
                        <div className="metric-label">Embodied Energy</div>
                      </div>
                      <div className="metric-box">
                        <div style={{ color: '#10b981', fontSize: '18px', fontWeight: '600' }}>
                          <Leaf size={16} style={{ display: 'inline', marginRight: '6px' }} />
                          {prediction.material.embodiedCarbon} kgCO₂/kg
                        </div>
                        <div className="metric-label">Embodied Carbon</div>
                      </div>
                    </div>
                  )}

                  <h4 style={{ color: '#f8fafc', marginBottom: '12px' }}>All Predictions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {prediction.allPredictions.slice(0, 5).map((p, idx) => (
                      <div 
                        key={p.class}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          padding: '12px',
                          background: p.confidence >= threshold ? (idx === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 'var(--bg-primary)',
                          borderRadius: '8px',
                          border: p.confidence >= threshold ? `1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}` : 'none'
                        }}
                      >
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          background: p.confidence >= threshold ? (idx === 0 ? '#10b981' : '#3b82f6') : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#f8fafc', fontWeight: '500' }}>
                            {p.className.replace(/_/g, ' ')}
                          </div>
                          <div style={{ 
                            height: '4px', 
                            background: '#334155', 
                            borderRadius: '2px', 
                            marginTop: '6px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${p.confidence * 100}%`,
                              height: '100%',
                              background: p.confidence >= threshold ? (idx === 0 ? '#10b981' : '#3b82f6') : '#475569',
                              borderRadius: '2px'
                            }} />
                          </div>
                        </div>
                        <div style={{ 
                          color: p.confidence >= threshold ? (idx === 0 ? '#10b981' : '#3b82f6') : '#94a3b8',
                          fontWeight: '600',
                          minWidth: '60px',
                          textAlign: 'right'
                        }}>
                          {(p.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    background: 'var(--bg-primary)', 
                    borderRadius: '8px' 
                  }}>
                    <h4 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '14px' }}>
                      <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      Model Info
                    </h4>
                    <div className="text-muted text-sm">
                      <div>Model: {prediction.modelName}</div>
                      <div>Model Accuracy: {(prediction.analysis.modelAccuracy * 100).toFixed(1)}%</div>
                      <div>Detection Threshold: {(prediction.analysis.threshold * 100).toFixed(0)}%</div>
                      <div>Materials Detected: {prediction.analysis.materialsDetected}</div>
                    </div>
                  </div>

                  {prediction.material?.alternatives?.length > 0 && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '16px', 
                      background: 'rgba(139, 92, 246, 0.1)', 
                      borderRadius: '8px' 
                    }}>
                      <h4 style={{ color: '#8b5cf6', marginBottom: '8px', fontSize: '14px' }}>
                        Lower Carbon Alternatives
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {prediction.material.alternatives.map(alt => (
                          <span key={alt} className="badge badge-info">
                            {alt.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Testing;
