import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import TerminalInterface from './components/TerminalInterface';
import MemeGrid from './components/MemeGrid';
import CreateMeme from './components/CreateMeme';
import TradingDashboard from './components/TradingDashboard';
import BackgroundEffects from './components/BackgroundEffects';
import { MemeProvider } from './context/MemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

type ViewType = 'terminal' | 'gallery' | 'create' | 'trading';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('terminal');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'terminal':
        return <TerminalInterface onNavigate={setCurrentView} />;
      case 'gallery':
        return <MemeGrid />;
      case 'create':
        return <CreateMeme onNavigate={setCurrentView} />;
      case 'trading':
        return <TradingDashboard />;
      default:
        return <TerminalInterface onNavigate={setCurrentView} />;
    }
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <MemeProvider>
          <div className="min-h-screen bg-black text-cyan-400 relative overflow-hidden">
            <BackgroundEffects />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isLoaded ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="relative z-10"
            >
              <Header currentView={currentView} onNavigate={setCurrentView} />
              
              <main className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderView()}
                  </motion.div>
                </AnimatePresence>
              </main>
            </motion.div>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(0, 0, 0, 0.9)',
                  color: '#00FFFF',
                  border: '1px solid #00FFFF',
                  borderRadius: '0px',
                  fontFamily: 'Rajdhani, sans-serif',
                },
              }}
            />
          </div>
        </MemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;