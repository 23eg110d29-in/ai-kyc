import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const UserDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('AADHAAR');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document_type', selectedType);
    formData.append('file', file);

    try {
      const res = await api.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Trigger verification pipeline immediately after upload
      await api.post(`/verify/${res.data.id}`);
      
      toast.success('Document uploaded and verification started!');
      setFile(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'REJECTED': return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'MANUAL_REVIEW': return <AlertCircle className="h-5 w-5 text-amber-400" />;
      default: return <Clock className="h-5 w-5 text-blue-400 animate-pulse" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MANUAL_REVIEW': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Upload and track your AI verification status.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium">
          <Sparkles className="h-4 w-4" /> LangGraph Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="glass-panel p-8 rounded-[2rem] h-fit relative overflow-hidden group border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            New Verification
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Document Type</label>
              <select 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white appearance-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="AADHAAR" className="bg-background">Aadhaar Card</option>
                <option value="PAN" className="bg-background">PAN Card</option>
                <option value="PASSPORT" className="bg-background">Passport</option>
                <option value="DRIVING_LICENSE" className="bg-background">Driving License</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Upload File</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-white/5 relative">
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="h-8 w-8 text-primary mx-auto mb-3 opacity-80" />
                <p className="text-sm text-white font-medium">
                  {file ? file.name : "Drag & drop or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF (max 10MB)</p>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={uploading || !file}
              className="w-full py-4 px-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-4 shadow-glow-primary"
            >
              {uploading ? 'Processing via AI...' : 'Verify Document'}
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Verifications</h2>
            <button onClick={fetchDocuments} className="text-sm font-medium text-primary hover:text-white transition-colors">Refresh list</button>
          </div>
          
          {loading ? (
            <div className="glass-panel p-12 rounded-[2rem] text-center text-muted-foreground animate-pulse border-white/5">
              Loading your documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="glass-panel p-16 rounded-[2rem] text-center border-white/5">
              <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No verifications yet</h3>
              <p className="text-muted-foreground">Upload a document to start your first verification.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="glass-panel p-6 rounded-[1.5rem] flex flex-col sm:flex-row sm:items-center justify-between hover:-translate-y-1 transition-transform border-white/10 group cursor-default">
                  <div className="flex items-center gap-5 mb-4 sm:mb-0">
                    <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                      <FileText className="h-6 w-6 text-white/70 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg tracking-tight">{doc.document_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(doc.created_at), 'MMMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 tracking-wide ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    {doc.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
