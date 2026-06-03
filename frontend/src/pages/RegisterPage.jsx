import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="h-12 w-12 text-primary mb-2" />
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-sm text-muted-foreground">Join the AI KYC Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              required
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              name="full_name"
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 mt-6 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
