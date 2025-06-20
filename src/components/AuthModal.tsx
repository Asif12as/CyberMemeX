import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);

    console.log('🚀 Starting authentication...');

    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      setIsSubmitting(false);
      return;
    }

    if (isSignUp && !username) {
      setError('Username is required for signup');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      
      if (isSignUp) {
        console.log('📝 Attempting signup...');
        result = await signUp(email, password, username);
      } else {
        console.log('🔑 Attempting signin...');
        result = await signIn(email, password);
      }

      if (result.success) {
        console.log('✅ Authentication successful!');
        // Close modal immediately on success
        onClose();
        resetForm();
      } else {
        console.error('❌ Authentication failed:', result.error);
        setError(result.error?.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('💥 Authentication exception:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setIsSubmitting(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-black/90 border border-cyber-blue/50 
                       backdrop-blur-md overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyber-blue/30">
              <h2 className="text-2xl font-orbitron font-bold text-cyber-blue glitch-text" 
                  data-text={isSignUp ? "JOIN THE MATRIX" : "ACCESS TERMINAL"}>
                {isSignUp ? "JOIN THE MATRIX" : "ACCESS TERMINAL"}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-cyber-pink transition-colors duration-300"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-sm flex items-center space-x-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {isSignUp && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-orbitron">
                    USERNAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-blue" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/80 border border-gray-600 focus:border-cyber-blue
                                 pl-12 pr-4 py-3 text-cyan-400 placeholder-gray-500 font-mono
                                 focus:outline-none focus:ring-2 focus:ring-cyber-blue/20
                                 transition-all duration-300 disabled:opacity-50"
                      placeholder="Enter your handle..."
                      required={isSignUp}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-orbitron">
                  EMAIL
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-blue" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/80 border border-gray-600 focus:border-cyber-blue
                               pl-12 pr-4 py-3 text-cyan-400 placeholder-gray-500 font-mono
                               focus:outline-none focus:ring-2 focus:ring-cyber-blue/20
                               transition-all duration-300 disabled:opacity-50"
                    placeholder="neural.link@matrix.net"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-orbitron">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyber-blue" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/80 border border-gray-600 focus:border-cyber-blue
                               pl-12 pr-4 py-3 text-cyan-400 placeholder-gray-500 font-mono
                               focus:outline-none focus:ring-2 focus:ring-cyber-blue/20
                               transition-all duration-300 disabled:opacity-50"
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyber-blue/20 to-cyber-green/20
                           border border-cyber-blue hover:border-cyber-green
                           py-4 px-6 font-orbitron font-bold text-cyber-blue
                           hover:text-cyber-green transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           neon-glow"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5 animate-spin" />
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>{isSignUp ? "CREATE ACCOUNT" : "ACCESS GRANTED"}</span>
                  </div>
                )}
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={isSubmitting}
                  className="text-cyber-pink hover:text-cyber-blue transition-colors duration-300 
                             font-orbitron disabled:opacity-50"
                >
                  {isSignUp 
                    ? "Already have access? Sign in" 
                    : "Need access? Create account"
                  }
                </button>
              </div>
            </form>

            {/* Scanline effect */}
            <div className="scanline" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;