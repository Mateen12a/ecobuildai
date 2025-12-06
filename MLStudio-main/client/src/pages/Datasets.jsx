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
  Loader,
  Search,
  Globe,
  Download,
  X,
  Check,
  ExternalLink,
  Info
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

  const [scrapeMode, setScrapeMode] = useState(false);
  const [scrapeQuery, setScrapeQuery] = useState('');
  const [scrapeResults, setScrapeResults] = useState([]);
  const [selectedScrapeImages, setSelectedScrapeImages] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [addingImages, setAddingImages] = useState(false);
  const [targetMaterial, setTargetMaterial] = useState('');
  const [searchError, setSearchError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSamples(selectedClass.id);
      setScrapeQuery(selectedClass.name || selectedClass.id.replace(/_/g, ' '));
      setTargetMaterial('');
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

  useEffect(() => {
    if (statusMessage.text) {
      const timer = setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
  };

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
        showStatus('success', `Uploaded ${newFiles.length} images successfully`);
      } else {
        const error = await response.json();
        showStatus('error', error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      showStatus('error', 'Upload failed. Please try again.');
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
        showStatus('success', 'Images deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting samples:', error);
      showStatus('error', 'Failed to delete images');
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

  const searchImages = async () => {
    const materialKey = targetMaterial || selectedClass?.id;
    if (!materialKey) {
      setSearchError('Please select a material class first');
      return;
    }
    
    if (!scrapeQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    
    setSearching(true);
    setScrapeResults([]);
    setSelectedScrapeImages(new Set());
    setSearchError('');
    
    try {
      const params = new URLSearchParams({
        q: scrapeQuery.trim(),
        count: '100',
        materialKey: materialKey,
        filterExisting: 'true'
      });
      const response = await fetch(`/api/image-scrape/search?${params}`);
      const data = await response.json();
      
      if (data.error) {
        setSearchError(data.error);
        return;
      }
      
      if (data.results && data.results.length > 0) {
        setScrapeResults(data.results);
      } else {
        setSearchError('No images found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching images:', error);
      setSearchError('Failed to search images. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const toggleScrapeImageSelection = (imageId) => {
    const newSelection = new Set(selectedScrapeImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedScrapeImages(newSelection);
  };

  const selectAllScrapeImages = () => {
    if (selectedScrapeImages.size === scrapeResults.length) {
      setSelectedScrapeImages(new Set());
    } else {
      setSelectedScrapeImages(new Set(scrapeResults.map(r => r.id)));
    }
  };

  const addSelectedToMaterial = async () => {
    const materialKey = targetMaterial || selectedClass?.id;
    if (!materialKey) {
      showStatus('error', 'Please select a material class first');
      return;
    }
    
    if (selectedScrapeImages.size === 0) {
      showStatus('error', 'Please select at least one image');
      return;
    }
    
    setAddingImages(true);
    
    try {
      const selectedItems = scrapeResults.filter(r => selectedScrapeImages.has(r.id));
      
      const stageResponse = await fetch('/api/image-scrape/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: scrapeQuery, items: selectedItems })
      });
      
      if (!stageResponse.ok) {
        const error = await stageResponse.json();
        throw new Error(error.error || 'Failed to stage images');
      }
      
      const stageData = await stageResponse.json();
      const stagedIds = stageData.items.map(item => item.id);
      
      const curateResponse = await fetch('/api/image-scrape/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialKey, stagedIds })
      });
      
      if (!curateResponse.ok) {
        const error = await curateResponse.json();
        throw new Error(error.error || 'Failed to add images');
      }
      
      const curateData = await curateResponse.json();
      
      const successMsg = `Added ${curateData.saved} image${curateData.saved !== 1 ? 's' : ''} to ${materialKey.replace(/_/g, ' ')}`;
      const failMsg = curateData.failed > 0 ? ` (${curateData.failed} failed to download)` : '';
      showStatus(curateData.saved > 0 ? 'success' : 'warning', successMsg + failMsg);
      
      const addedIds = new Set(selectedItems.map(i => i.id));
      setScrapeResults(scrapeResults.filter(r => !addedIds.has(r.id)));
      setSelectedScrapeImages(new Set());
      
      fetchClasses();
      if (materialKey === selectedClass?.id) {
        fetchSamples(materialKey);
      }
    } catch (error) {
      console.error('Error adding images:', error);
      showStatus('error', error.message || 'Failed to add images. Please try again.');
    } finally {
      setAddingImages(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>Dataset Manager</h2>
            <p>Upload training images or search the web for each material class.</p>
          </div>
          <button 
            className={`btn ${scrapeMode ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setScrapeMode(!scrapeMode);
              setScrapeResults([]);
              setSelectedScrapeImages(new Set());
              setSearchError('');
            }}
            data-testid="button-toggle-scrape-mode"
          >
            <Globe size={16} />
            {scrapeMode ? 'Back to Upload' : 'Search Web Images'}
          </button>
        </div>
      </div>

      {statusMessage.text && (
        <div 
          className={`alert ${statusMessage.type === 'success' ? 'alert-success' : statusMessage.type === 'warning' ? 'alert-warning' : 'alert-danger'}`}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 
                       statusMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : 
                                statusMessage.type === 'warning' ? '#f59e0b' : '#ef4444'}`,
            color: statusMessage.type === 'success' ? '#10b981' : 
                   statusMessage.type === 'warning' ? '#f59e0b' : '#ef4444'
          }}
          data-testid="status-message"
        >
          {statusMessage.type === 'success' ? <Check size={16} /> : 
           statusMessage.type === 'warning' ? <Info size={16} /> : <AlertCircle size={16} />}
          {statusMessage.text}
          <button 
            onClick={() => setStatusMessage({ type: '', text: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Material Classes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
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
                data-testid={`button-class-${cls.id}`}
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
          {scrapeMode ? (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Globe size={20} style={{ marginRight: '8px' }} />
                  Search Web for "{selectedClass?.name || 'Material'}" Images
                </h3>
              </div>
              
              <div style={{ 
                padding: '12px', 
                background: 'rgba(59, 130, 246, 0.1)', 
                borderRadius: '8px', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#60a5fa'
              }}>
                <Info size={16} />
                Images are sourced from Unsplash and Pixabay. All results are automatically resized to 224x224.
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={scrapeQuery}
                  onChange={(e) => {
                    setScrapeQuery(e.target.value);
                    setSearchError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !searching && searchImages()}
                  placeholder="Search for material images..."
                  className="input"
                  style={{ flex: 1 }}
                  disabled={searching}
                  data-testid="input-scrape-query"
                />
                <button 
                  className="btn btn-primary"
                  onClick={searchImages}
                  disabled={searching || !scrapeQuery.trim()}
                  data-testid="button-search-images"
                >
                  {searching ? <Loader size={16} className="spinning" /> : <Search size={16} />}
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {searchError && (
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={16} />
                  {searchError}
                </div>
              )}
              
              {scrapeResults.length > 0 && (
                <>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    borderRadius: '8px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={selectAllScrapeImages}
                        disabled={addingImages}
                        data-testid="button-select-all-scrape"
                      >
                        {selectedScrapeImages.size === scrapeResults.length ? (
                          <><CheckSquare size={14} /> Deselect All</>
                        ) : (
                          <><Square size={14} /> Select All ({scrapeResults.length})</>
                        )}
                      </button>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {selectedScrapeImages.size} selected
                      </span>
                    </div>
                    
                    {selectedScrapeImages.size > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <select
                          value={targetMaterial}
                          onChange={(e) => setTargetMaterial(e.target.value)}
                          className="select"
                          style={{ minWidth: '200px' }}
                          disabled={addingImages}
                          data-testid="select-target-material"
                        >
                          <option value="">Add to: {selectedClass?.name || 'Select class'}</option>
                          {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                          ))}
                        </select>
                        <button 
                          className="btn btn-success"
                          onClick={addSelectedToMaterial}
                          disabled={addingImages || (!targetMaterial && !selectedClass)}
                          data-testid="button-add-selected"
                        >
                          {addingImages ? (
                            <><Loader size={16} className="spinning" /> Adding...</>
                          ) : (
                            <><Download size={16} /> Add {selectedScrapeImages.size} to Dataset</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="samples-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '12px' 
                  }}>
                    {scrapeResults.map(image => (
                      <div
                        key={image.id}
                        className={`sample-card ${selectedScrapeImages.has(image.id) ? 'selected' : ''}`}
                        onClick={() => !addingImages && toggleScrapeImageSelection(image.id)}
                        style={{ 
                          cursor: addingImages ? 'not-allowed' : 'pointer', 
                          position: 'relative',
                          opacity: addingImages ? 0.6 : 1
                        }}
                        data-testid={`scrape-image-${image.id}`}
                      >
                        <img 
                          src={image.thumbnailUrl} 
                          alt={image.title}
                          loading="lazy"
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.background = 'var(--bg-secondary)';
                          }}
                        />
                        <div style={{ 
                          position: 'absolute', 
                          top: '8px', 
                          right: '8px',
                          background: selectedScrapeImages.has(image.id) ? '#10b981' : 'rgba(0,0,0,0.5)',
                          borderRadius: '50%',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedScrapeImages.has(image.id) ? (
                            <Check size={16} color="white" />
                          ) : (
                            <Square size={16} color="white" />
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '10px', 
                          color: 'var(--text-muted)', 
                          marginTop: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {image.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {!searching && scrapeResults.length === 0 && !searchError && (
                <div className="empty-state">
                  <Search size={48} />
                  <h3>Search for images</h3>
                  <p>Enter a search term and click Search to find images from the web</p>
                </div>
              )}
              
              {searching && (
                <div className="empty-state">
                  <Loader size={48} className="spinning" />
                  <h3>Searching...</h3>
                  <p>Finding images for "{scrapeQuery}"</p>
                </div>
              )}
            </div>
          ) : (
            selectedClass ? (
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
                    data-testid="upload-zone"
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
                    data-testid="input-file-upload"
                  />
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      Training Samples ({samples.length})
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => fetchSamples(selectedClass.id)}
                        data-testid="button-refresh-samples"
                      >
                        <RefreshCw size={14} />
                        Refresh
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={selectAllSamples}
                        data-testid="button-select-all"
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
                          data-testid="button-delete-selected"
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
                      <p>Upload images or search the web to start building this class dataset</p>
                    </div>
                  ) : (
                    <div className="samples-grid">
                      {samples.map(sample => (
                        <div
                          key={sample.id}
                          className={`sample-card ${selectedSamples.has(sample.id) ? 'selected' : ''}`}
                          onClick={() => toggleSampleSelection(sample.id)}
                          data-testid={`sample-${sample.id}`}
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
                                data-testid={`button-delete-sample-${sample.id}`}
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
            ) : (
              <div className="card">
                <div className="empty-state">
                  <FolderOpen size={48} />
                  <h3>Select a Material Class</h3>
                  <p>Choose a material class from the left panel to view and manage its training images</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Datasets;
