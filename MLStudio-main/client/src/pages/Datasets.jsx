import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, 
  Trash2, 
  Image,
  CheckSquare,
  Square,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  Loader
} from 'lucide-react';

function Datasets() {
  const [searchParams] = useSearchParams();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [samples, setSamples] = useState([]);
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const classFromUrl = searchParams.get('class');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSamples(selectedClass.id);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (classes.length > 0 && classFromUrl) {
      const targetClass = classes.find(c => c.id === classFromUrl);
      if (targetClass) {
        setSelectedClass(targetClass);
      }
    }
  }, [classes, classFromUrl]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
      if (data.length > 0 && !selectedClass && !classFromUrl) {
        setSelectedClass(data[0]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSamples = async (classId) => {
    try {
      const response = await fetch(`/api/classes/${classId}/samples`);
      const data = await response.json();
      setSamples(data);
      setSelectedSamples(new Set());
    } catch (error) {
      console.error('Error fetching samples:', error);
    }
  };

  const handleFileUpload = async (files) => {
    if (!selectedClass || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`/api/classes/${selectedClass.id}/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const newFiles = await response.json();
        setSamples(prev => [...newFiles, ...prev]);
        fetchClasses();
        setUploadProgress(100);
      } else {
        const error = await response.json();
        alert(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const toggleSampleSelection = (sampleId) => {
    const newSelection = new Set(selectedSamples);
    if (newSelection.has(sampleId)) {
      newSelection.delete(sampleId);
    } else {
      newSelection.add(sampleId);
    }
    setSelectedSamples(newSelection);
  };

  const selectAllSamples = () => {
    if (selectedSamples.size === samples.length) {
      setSelectedSamples(new Set());
    } else {
      setSelectedSamples(new Set(samples.map(s => s.id)));
    }
  };

  const deleteSelectedSamples = async () => {
    if (selectedSamples.size === 0 || !selectedClass) return;
    
    if (!confirm(`Delete ${selectedSamples.size} selected image(s)? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/classes/${selectedClass.id}/samples`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleIds: Array.from(selectedSamples) })
      });

      if (response.ok) {
        setSamples(samples.filter(s => !selectedSamples.has(s.id)));
        setSelectedSamples(new Set());
        fetchClasses();
      }
    } catch (error) {
      console.error('Error deleting samples:', error);
    }
  };

  const deleteSample = async (sampleId) => {
    if (!selectedClass) return;
    
    try {
      const response = await fetch(`/api/classes/${selectedClass.id}/samples/${sampleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSamples(samples.filter(s => s.id !== sampleId));
        selectedSamples.delete(sampleId);
        setSelectedSamples(new Set(selectedSamples));
        fetchClasses();
      }
    } catch (error) {
      console.error('Error deleting sample:', error);
    }
  };

  if (classes.length === 0 && !loading) {
    return (
      <div>
        <div className="page-header">
          <h2>Dataset Manager</h2>
          <p>Upload and manage training images for each ICE material class</p>
        </div>
        
        <div className="card">
          <div className="empty-state">
            <AlertCircle size={64} />
            <h3>No material classes available</h3>
            <p>Material classes are loaded from the ICE database. Check your connection.</p>
            <button className="btn btn-primary mt-4" onClick={fetchClasses}>
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dataset Manager</h2>
        <p>Upload training images for each ICE material class. Images are preprocessed (224x224) and stored in MongoDB.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Material Classes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classes.map(cls => (
              <button
                key={cls.id}
                className={`class-card ${selectedClass?.id === cls.id ? 'selected' : ''}`}
                style={{ 
                  padding: '14px', 
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedClass(cls)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontWeight: 500, 
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.3'
                  }}>
                    {cls.name.length > 30 ? cls.id.replace(/_/g, ' ').toUpperCase() : cls.name}
                  </span>
                  <span className={`badge ${cls.sampleCount > 0 ? 'badge-success' : 'badge-info'}`}>
                    {cls.sampleCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Dataset Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Images:</span>
              <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                {classes.reduce((sum, c) => sum + c.sampleCount, 0)}
              </span>
            </div>
          </div>
        </div>

        <div>
          {selectedClass && (
            <>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    Upload Images for "{selectedClass.id.replace(/_/g, ' ')}"
                  </h3>
                </div>
                
                <div
                  className={`upload-zone ${dragging ? 'dragging' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader size={48} className="upload-zone-icon spinning" />
                      <p className="upload-zone-text">
                        <strong>Uploading and preprocessing...</strong>
                      </p>
                      <div style={{ 
                        width: '200px', 
                        height: '8px', 
                        background: '#334155', 
                        borderRadius: '4px',
                        marginTop: '12px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${uploadProgress}%`, 
                          height: '100%', 
                          background: '#3b82f6',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={48} className="upload-zone-icon" />
                      <p className="upload-zone-text">
                        <strong>Click to upload</strong> or drag and drop
                      </p>
                      <p className="upload-zone-text">
                        JPEG, PNG or WebP images (max 100 at a time)
                      </p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>
                        Images will be resized to 224x224 and stored in MongoDB
                      </p>
                    </>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    Training Samples ({samples.length})
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => fetchSamples(selectedClass.id)}
                    >
                      <RefreshCw size={14} />
                      Refresh
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={selectAllSamples}
                    >
                      {selectedSamples.size === samples.length ? (
                        <><CheckSquare size={14} /> Deselect All</>
                      ) : (
                        <><Square size={14} /> Select All</>
                      )}
                    </button>
                    {selectedSamples.size > 0 && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={deleteSelectedSamples}
                      >
                        <Trash2 size={14} />
                        Delete ({selectedSamples.size})
                      </button>
                    )}
                  </div>
                </div>

                {samples.length === 0 ? (
                  <div className="empty-state">
                    <Image size={48} />
                    <h3>No training images yet</h3>
                    <p>Upload images to start building this class dataset</p>
                  </div>
                ) : (
                  <div className="samples-grid">
                    {samples.map(sample => (
                      <div
                        key={sample.id}
                        className={`sample-card ${selectedSamples.has(sample.id) ? 'selected' : ''}`}
                        onClick={() => toggleSampleSelection(sample.id)}
                      >
                        <img 
                          src={sample.thumbnailUrl || sample.url} 
                          alt={sample.filename}
                          loading="lazy"
                        />
                        <div className="sample-card-overlay">
                          {selectedSamples.has(sample.id) ? (
                            <CheckSquare size={24} color="white" />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSample(sample.id);
                              }}
                              style={{ 
                                background: 'rgba(239, 68, 68, 0.8)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={16} color="white" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Datasets;
