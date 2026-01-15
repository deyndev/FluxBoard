import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-accent/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl border border-accent/20 shadow-inner shadow-accent/10">
              <Sparkles className="w-8 h-8 text-accent fill-accent/20" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white to-secondary bg-clip-text text-transparent">Create Account</h2>
          <p className="text-secondary text-center mb-8">Join the Flux Universe</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm backdrop-blur-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

             <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary ml-1 uppercase tracking-wider">Username</label>
              <div className="relative group/input">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within/input:text-accent transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all text-sm placeholder:text-white/20 text-white"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary ml-1 uppercase tracking-wider">Email</label>
              <div className="relative group/input">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within/input:text-accent transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all text-sm placeholder:text-white/20 text-white"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-secondary ml-1 uppercase tracking-wider">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within/input:text-accent transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all text-sm placeholder:text-white/20 text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "w-full bg-gradient-to-r from-accent to-pink-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] active:scale-[0.98]",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-accent font-medium transition-colors relative group/link">
              Sign in
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all group-hover/link:w-full" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
