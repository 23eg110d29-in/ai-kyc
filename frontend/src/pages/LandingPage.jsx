import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileSearch, Fingerprint, Zap, ArrowRight, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-sans">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 bg-mesh-dark opacity-40 z-0 pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto w-full glass-panel mt-6 rounded-full px-8 border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-primary">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AI KYC Platform</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="text-sm font-medium bg-white text-black px-6 py-2.5 rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-glow-accent">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 mt-20">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 text-sm font-medium text-accent-foreground">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          LangGraph Multi-Agent Pipeline Live
        </div>

        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter relative z-10 leading-[1.1] text-white">
            Next-Gen Identity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-accent">
              Verification
            </span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 font-light">
          Automate your KYC compliance with AI. Extract, validate, and verify identity documents instantly with our intelligent multi-agent pipeline.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link to="/register" className="group flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full shadow-glow-primary hover:shadow-glow-accent transition-all hover:-translate-y-1">
            Start Verifying Now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="group flex items-center gap-2 text-lg font-medium px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white/80">
            View Documentation
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto text-left w-full">
          <div className="glass-panel p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 group">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/0 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:shadow-glow-primary transition-shadow">
              <FileSearch className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Smart OCR Extraction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Instantly extract data from Aadhaar, PAN, Passports and more using advanced OCR and LLM-based entity parsing.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 group">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/0 border border-purple-500/30 flex items-center justify-center mb-6 group-hover:shadow-glow-accent transition-shadow">
              <Fingerprint className="h-7 w-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Fraud Detection</h3>
            <p className="text-muted-foreground leading-relaxed">
              Detect tampered images, duplicate documents, and inconsistencies instantly using LangGraph AI agents.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 group">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-glow-emerald transition-shadow">
              <Zap className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">RAG Compliance</h3>
            <p className="text-muted-foreground leading-relaxed">
              Built-in knowledge base queries RBI and AML guidelines in real-time to ensure every verification is compliant.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 border-t border-white/5 mt-24 py-12 text-center text-muted-foreground flex flex-col items-center">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-4 opacity-50">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <p className="text-sm">© 2026 AI KYC Verification Platform. Built with FastAPI & React.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
