import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  FolderOpen, 
  Box, 
  TrendingUp,
  Play,
  CheckCircle,
  AlertCircle,
  Leaf,
  Zap,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrainingContext } from '../App';

const COLORS = ['#ef4444', '#6b7280', '#a78bfa', '#60a5fa', '#9ca3af', '#fbbf24', '#78350f', '#84cc16', '#06b6d4', '#64748b', '#f472b6', '#22c55e', '#e2e8f0', '#fb923c', '#8b5cf6'];

function Dashboard() {
  const navigate = useNavigate();
  const { trainingStatus } = useContext(TrainingContext);
  const [stats, setStats] = useState(null);
  const [models, setModels] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, modelsRes, classesRes] = await Promise.all([
        fetch('/api/dataset/stats'),
        fetch('/api/models'),
        fetch('/api/classes')
      ]);
      
      const statsData = await statsRes.json();
      const modelsData = await modelsRes.json();
      const classesData = await classesRes.json();
      
      setStats(statsData);
      setModels(modelsData);
      setAllClasses(classesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeModel = models.find(m => m.isActive);

  const pieData = stats?.classDistribution?.filter(item => item.count > 0).map((item, index) => ({
    name: item.classId.replace(/_/g, ' '),
    value: item.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Material Detection Model Training Studio</p>
      </div>

      <div className="card" style={{ 
        marginBottom: '24px', 
        background: 'linear-gradient(135deg, #064e3b 0%, #1e293b 100%)',
        border: '1px solid #10b981'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '16px', 
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Leaf size={40} color="#10b981" />
          </div>
          <div>
            <h3 style={{ color: '#f8fafc', marginBottom: '8px', fontSize: '20px' }}>
              Carbon Footprint Analysis Ready
            </h3>
            <p className="text-muted" style={{ maxWidth: '600px' }}>
              Train ML models to detect {allClasses.length} construction materials. 
              Upload images, train the model, and deploy to your carbon footprint analysis app 
              for automatic material detection and embodied carbon calculations.
            </p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div 
          className="stat-card cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => navigate('/classes')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon blue">
            <FolderOpen size={20} />
          </div>
          <div className="stat-value">{allClasses.length}</div>
          <div className="stat-label">Material Classes</div>
        </div>
        
        <div 
          className="stat-card cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => navigate('/datasets')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon green">
            <Database size={20} />
          </div>
          <div className="stat-value">{stats?.totalSamples || 0}</div>
          <div className="stat-label">Training Images (MongoDB)</div>
        </div>
        
        <div 
          className="stat-card cursor-pointer hover:border-purple-500 transition-colors"
          onClick={() => navigate('/models')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon purple">
            <Box size={20} />
          </div>
          <div className="stat-value">{models.length}</div>
          <div className="stat-label">Trained Models</div>
        </div>
        
        <div 
          className="stat-card cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => navigate('/models')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-card-icon orange">
            <TrendingUp size={20} />
          </div>
          <div className="stat-value">
            {activeModel ? `${(activeModel.metrics?.valAccuracy * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="stat-label">Active Model Accuracy</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dataset Distribution</h3>
          </div>
          {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <Database size={48} />
              <h3>No training data yet</h3>
              <p>Upload images to the Dataset Manager to see distribution</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Samples per Class</h3>
          </div>
          {stats?.classDistribution?.length > 0 ? (
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.classDistribution} layout="vertical">
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis 
                    type="category" 
                    dataKey="classId"
                    stroke="#64748b"
                    width={100}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => v.replace(/_/g, ' ')}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <FolderOpen size={48} />
              <h3>No classes yet</h3>
              <p>Classes are loaded from ICE database</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Training Status</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div className="status-indicator">
              <span className={`status-dot ${trainingStatus.status === 'running' ? 'running' : 'idle'}`}></span>
              <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                {trainingStatus.status}
              </span>
            </div>
          </div>
          
          {trainingStatus.status === 'idle' ? (
            <div>
              <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>
                Ready to train. Need at least 2 classes with 10+ total images.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/training')}
              >
                <Play size={16} />
                Start Training
              </button>
            </div>
          ) : trainingStatus.status === 'running' ? (
            <div>
              <p className="text-muted text-sm">
                Training in progress. Check the Training page for details.
              </p>
              <button 
                className="btn btn-secondary mt-4"
                onClick={() => navigate('/training')}
              >
                View Progress
              </button>
            </div>
          ) : trainingStatus.status === 'completed' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <CheckCircle size={20} />
              <span>Training completed successfully!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <AlertCircle size={20} />
              <span>Training failed. Check logs for details.</span>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Model</h3>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/models')}
            >
              Manage Models
            </button>
          </div>
          
          {activeModel ? (
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '18px', marginBottom: '12px' }}>
                {activeModel.name}
              </h4>
              <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="metric-box">
                  <div className="metric-value" style={{ color: '#10b981' }}>
                    {(activeModel.metrics?.valAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="metric-label">Validation Accuracy</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value" style={{ color: '#3b82f6' }}>
                    {activeModel.metrics?.valLoss?.toFixed(4) || 'N/A'}
                  </div>
                  <div className="metric-label">Validation Loss</div>
                </div>
              </div>
              <div className="text-muted text-sm mt-4">
                <Target size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Trained on {activeModel.classes?.length || 0} material classes
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <Box size={48} />
              <h3>No active model</h3>
              <p>Train a model and it will be automatically activated</p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate('/classes')}>
            <FolderOpen size={16} />
            View Material Classes
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/datasets')}>
            <Database size={16} />
            Upload Images
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/training')}>
            <Play size={16} />
            Train Model
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/models')}>
            <Box size={16} />
            Manage Models
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px', background: 'var(--bg-primary)' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <Zap size={20} style={{ display: 'inline', marginRight: '8px', color: '#f97316' }} />
          Workflow Guide
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#3b82f620',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '18px' }}>1</span>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>Upload Images</div>
            <div className="text-muted text-sm">Add labeled images per material class</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#10b98120',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>2</span>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>Train Model</div>
            <div className="text-muted text-sm">One-click training with progress monitoring</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#8b5cf620',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ color: '#8b5cf6', fontWeight: 'bold', fontSize: '18px' }}>3</span>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>Review Metrics</div>
            <div className="text-muted text-sm">Check accuracy and compare models</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#f9731620',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <span style={{ color: '#f97316', fontWeight: 'bold', fontSize: '18px' }}>4</span>
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>Deploy</div>
            <div className="text-muted text-sm">Activate best model for your app</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
