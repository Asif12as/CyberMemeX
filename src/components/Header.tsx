import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Image, Plus, TrendingUp, Zap, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'terminal' | 'gallery' | 'create' | 'trading') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const { user, profile, signOut, isAuthenticated, loading, authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'terminal', icon: Terminal, label: 'TERMINAL', color: 'text-cyber-blue' },
    { id: 'gallery', icon: Image, label: 'GALLERY', color: 'text-cyber-pink' },
    { id: 'create', icon: Plus, label: 'CREATE', color: 'text-cyber-green' },
    { id: 'trading', icon: TrendingUp, label: 'TRADING', color: 'text-cyber-purple' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading state while determining auth status
  if (loading) {
    return (
      <header className="relative z-20 border-b border-cyan-400/30 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-8 h-8 text-cyber-blue neon-glow" />
              <h1 className="text-2xl font-orbitron font-bold glitch-text" data-text="CYBERMEME">
                CYBERMEME
              </h1>
            </motion.div>

            {/* Loading indicator */}
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyber-blue animate-spin" />
              <span className="text-cyber-blue font-orbitron text-sm">INITIALIZING...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="relative z-20 border-b border-cyan-400/30 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-8 h-8 text-cyber-blue neon-glow" />
              <h1 className="text-2xl font-orbitron font-bold glitch-text" data-text="CYBERMEME">
                CYBERMEME
              </h1>
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-cyber-blue p-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-cyber-pink" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onNavigate(item.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 font-orbitron font-bold
                      ${isActive ? item.color + ' neon-glow' : 'text-gray-400 hover:' + item.color}
                      transition-all duration-300 relative group`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-current"
                        layoutId="activeTab"
                        initial={false}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* User Profile */}
            {isAuthenticated && user && profile ? (
              <motion.div
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-right">
                  <div className="text-sm font-orbitron text-cyber-blue">{profile.username}</div>
                  <div className="text-xs text-gray-400">{profile.credits} CREDITS</div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-cyber-blue" />
                  <motion.button
                    onClick={handleSignOut}
                    disabled={authLoading}
                    className="text-cyber-pink hover:text-cyber-blue transition-colors duration-300
                               disabled:opacity-50"
                    whileHover={!authLoading ? { scale: 1.1 } : {}}
                    whileTap={!authLoading ? { scale: 0.95 } : {}}
                  >
                    {authLoading ? (
                      <Zap className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-cyber-blue/20 
                           border border-cyber-blue text-cyber-blue font-orbitron font-bold
                           hover:bg-cyber-blue/30 transition-all duration-300 neon-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="w-5 h-5" />
                <span>ACCESS</span>
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Scanline effect */}
        <div className="scanline" />
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="fixed inset-x-0 top-[72px] z-30 bg-black/95 border-b border-cyan-400/30 backdrop-blur-md md:hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 font-orbitron font-bold
                      ${isActive ? item.color + ' neon-glow' : 'text-gray-400 hover:' + item.color}
                      transition-all duration-300 relative border-b border-gray-800`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Header;