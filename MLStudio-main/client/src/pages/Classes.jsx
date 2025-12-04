import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen,
  Image,
  Leaf,
  Zap,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Layers,
  Settings,
  ExternalLink
} from 'lucide-react';

const MATERIAL_COLORS = {
  bricks: '#ef4444',
  concrete: '#6b7280',
  aggregate: '#a78bfa',
  aerated_block: '#60a5fa',
  concrete_block: '#9ca3af',
  limestone_block: '#fbbf24',
  rammed_earth: '#78350f',
  timber: '#84cc16',
  steel: '#475569',
  glass: '#06b6d4',
  aluminum: '#64748b',
  insulation_mineral_wool: '#f472b6',
  insulation_cellulose: '#22c55e',
  plasterboard: '#e2e8f0',
  ceramic_tiles: '#fb923c'
};

const DEFAULT_CATEGORIES = [
  { id: 'ice', name: 'ICE Database Materials', description: 'Inventory of Carbon and Energy database materials', isDefault: true },
  { id: 'custom', name: 'Custom Classes', description: 'User-defined material classes', isDefault: true }
];

function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('materialCategories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [loading, setLoading] = useState(true);
  const [classSamples, setClassSamples] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    embodiedEnergy: '',
    embodiedCarbon: '',
    density: '',
    alternatives: '',
    category: 'custom'
  });
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    localStorage.setItem('materialCategories', JSON.stringify(categories));
  }, [categories]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
      
      data.forEach(cls => {
        fetchClassSamples(cls.id);
      });
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSamples = async (classId) => {
    try {
      const response = await fetch(`/api/classes/${classId}/samples`);
      const samples = await response.json();
      setClassSamples(prev => ({ ...prev, [classId]: samples.slice(0, 4) }));
    } catch (error) {
      console.error('Error fetching samples:', error);
    }
  };

  const getMaterialColor = (classId) => {
    return MATERIAL_COLORS[classId] || '#3b82f6';
  };

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      key: '',
      name: '',
      description: '',
      embodiedEnergy: '',
      embodiedCarbon: '',
      density: '',
      alternatives: '',
      category: 'custom'
    });
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({
      key: cls.id,
      name: cls.name,
      description: cls.description || '',
      embodiedEnergy: cls.embodiedEnergy || '',
      embodiedCarbon: cls.embodiedCarbon || '',
      density: cls.density || '',
      alternatives: cls.alternatives?.join(', ') || '',
      category: cls.category || 'custom'
    });
    setShowModal(true);
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      id: '',
      name: '',
      description: ''
    });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      id: cat.id,
      name: cat.name,
      description: cat.description || ''
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryFormData.name, description: categoryFormData.description }
          : cat
      ));
    } else {
      const newId = categoryFormData.id.toLowerCase().replace(/\s+/g, '_');
      if (categories.some(c => c.id === newId)) {
        alert('Category ID already exists');
        return;
      }
      setCategories(prev => [...prev, {
        id: newId,
        name: categoryFormData.name,
        description: categoryFormData.description,
        isDefault: false
      }]);
    }
    setShowCategoryModal(false);
  };

  const deleteCategory = (catId) => {
    const cat = categories.find(c => c.id === catId);
    if (cat?.isDefault) {
      alert('Cannot delete default categories');
      return;
    }
    if (!confirm(`Are you sure you want to delete the category "${cat?.name}"?`)) return;
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      key: formData.key,
      name: formData.name,
      description: formData.description,
      embodiedEnergy: parseFloat(formData.embodiedEnergy) || 0,
      embodiedCarbon: parseFloat(formData.embodiedCarbon) || 0,
      density: parseFloat(formData.density) || 0,
      alternatives: formData.alternatives.split(',').map(s => s.trim()).filter(Boolean),
      category: formData.category
    };

    try {
      const url = editingClass 
        ? `/api/classes/${editingClass.id}`
        : '/api/classes';
      
      const response = await fetch(url, {
        method: editingClass ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save class');
      }
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class');
    }
  };

  const deleteClass = async (classId) => {
    if (!confirm('Are you sure you want to delete this class? All associated images will also be deleted.')) return;

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const iceClasses = classes.filter(c => !c.isCustom);
  const customClasses = classes.filter(c => c.isCustom);
  const userCategories = categories.filter(c => !c.isDefault);

  const handleClassClick = (classId) => {
    navigate(`/datasets?class=${classId}`);
  };

  const renderClassCard = (cls, showActions = false) => {
    const color = getMaterialColor(cls.id) || '#8b5cf6';
    
    return (
      <div 
        key={cls.id}
        className="class-card group cursor-pointer hover:shadow-lg transition-all"
        style={{ borderLeft: `4px solid ${color}` }}
        onClick={() => handleClassClick(cls.id)}
      >
        <div className="class-card-header">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ background: color }}
            />
            <span className="class-card-name text-sm">
              {cls.name}
            </span>
            {cls.isCustom && (
              <span className="badge badge-info text-xs">Custom</span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className="class-card-count">{cls.sampleCount} images</span>
            <ExternalLink size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            {showActions && (
              <>
                <button 
                  className="btn btn-outline btn-sm p-1 px-2" 
                  onClick={(e) => { e.stopPropagation(); openEditModal(cls); }}
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  className="btn btn-danger btn-sm p-1 px-2" 
                  onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {cls.description && (
          <p className="class-card-description text-sm">
            {cls.description}
          </p>
        )}
        
        <div className="flex gap-4 mt-3 p-3 bg-[var(--bg-primary)] rounded-lg">
          <div className="text-center flex-1">
            <div className="text-xs text-[var(--text-muted)] mb-1">
              <Zap size={12} className="inline mr-1" />
              Energy
            </div>
            <div className="text-sm text-orange-500 font-semibold">
              {cls.embodiedEnergy || 'N/A'} MJ/kg
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-xs text-[var(--text-muted)] mb-1">
              <Leaf size={12} className="inline mr-1" />
              Carbon
            </div>
            <div className="text-sm text-emerald-500 font-semibold">
              {cls.embodiedCarbon || 'N/A'} kgCO₂/kg
            </div>
          </div>
        </div>

        {cls.alternatives?.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-[var(--text-muted)] mb-1.5">
              Lower carbon alternatives:
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {cls.alternatives.map(alt => (
                <span key={alt} className="badge badge-info text-xs">
                  {alt.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="class-card-preview mt-3">
          {classSamples[cls.id]?.length > 0 ? (
            classSamples[cls.id].map(sample => (
              <img 
                key={sample.id}
                src={sample.thumbnailUrl || sample.url}
                alt={sample.filename}
                className="w-12 h-12 rounded-md object-cover"
              />
            ))
          ) : (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-2">
              <Image size={16} />
              No training images yet
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h2>Material Classes</h2>
            <p>Material database classes and custom classes for carbon footprint analysis</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline" onClick={openAddCategoryModal}>
              <Layers size={16} />
              Add Category
            </button>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} />
              Add Custom Class
            </button>
            <button className="btn btn-outline" onClick={fetchClasses}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="card mb-6 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Leaf size={28} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] mb-1">Material Classification System</h3>
            <p className="text-muted">
              Manage material classes for accurate embodied carbon calculations.
              Create custom categories and classes to extend your training dataset.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="empty-state">
            <RefreshCw size={48} className="spinning" />
            <h3>Loading materials...</h3>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Leaf size={18} className="text-emerald-500" />
            ICE Database Materials ({iceClasses.length})
          </h3>
          <div className="classes-grid mb-8">
            {iceClasses.map(cls => renderClassCard(cls, false))}
          </div>

          {customClasses.length > 0 && (
            <>
              <h3 className="text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FolderOpen size={18} className="text-blue-500" />
                Custom Classes ({customClasses.length})
              </h3>
              <div className="classes-grid mb-8">
                {customClasses.map(cls => renderClassCard(cls, true))}
              </div>
            </>
          )}

          {userCategories.length > 0 && (
            <>
              <h3 className="text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Settings size={18} className="text-purple-500" />
                User Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {userCategories.map(cat => (
                  <div key={cat.id} className="card p-4 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[var(--text-primary)] font-semibold">{cat.name}</h4>
                        <p className="text-sm text-[var(--text-muted)]">{cat.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-outline btn-sm p-1 px-2"
                          onClick={() => openEditCategoryModal(cat)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm p-1 px-2"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingClass ? 'Edit Class' : 'Add Custom Class'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Key (unique identifier)</label>
                <input 
                  className="input"
                  value={formData.key}
                  onChange={e => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., recycled_concrete"
                  disabled={!!editingClass}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Recycled Concrete"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="input"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter(c => c.id !== 'ice').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <input 
                  className="input"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the material"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Embodied Energy (MJ/kg)</label>
                  <input 
                    className="input"
                    type="number"
                    step="0.01"
                    value={formData.embodiedEnergy}
                    onChange={e => setFormData({ ...formData, embodiedEnergy: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Embodied Carbon (kgCO₂/kg)</label>
                  <input 
                    className="input"
                    type="number"
                    step="0.001"
                    value={formData.embodiedCarbon}
                    onChange={e => setFormData({ ...formData, embodiedCarbon: e.target.value })}
                    placeholder="0.000"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Density (kg/m³)</label>
                <input 
                  className="input"
                  type="number"
                  value={formData.density}
                  onChange={e => setFormData({ ...formData, density: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Alternatives (comma-separated keys)</label>
                <input 
                  className="input"
                  value={formData.alternatives}
                  onChange={e => setFormData({ ...formData, alternatives: e.target.value })}
                  placeholder="e.g., concrete, limestone_block"
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category ID</label>
                <input 
                  className="input"
                  value={categoryFormData.id}
                  onChange={e => setCategoryFormData({ ...categoryFormData, id: e.target.value })}
                  placeholder="e.g., recycled_materials"
                  disabled={!!editingCategory}
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Lowercase, use underscores for spaces</p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  className="input"
                  value={categoryFormData.name}
                  onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g., Recycled Materials"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <input 
                  className="input"
                  value={categoryFormData.description}
                  onChange={e => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Brief description of this category"
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;
