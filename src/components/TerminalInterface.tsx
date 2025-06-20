import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight, Zap } from 'lucide-react';

interface TerminalInterfaceProps {
  onNavigate: (view: 'terminal' | 'gallery' | 'create' | 'trading') => void;
}

const TerminalInterface: React.FC<TerminalInterfaceProps> = ({ onNavigate }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const bootSequence = [
    '> CYBERMEME TRADING PLATFORM v2.0.77',
    '> INITIALIZING NEURAL NETWORK...',
    '> [████████████████████████████████] 100%',
    '> CONNECTION ESTABLISHED',
    '> SUPABASE DATABASE ONLINE ✓',
    '> AUTHENTICATION SYSTEM ACTIVE ✓',
    '> REAL-TIME TRADING ENGINE READY ✓',
    '> BLOCKCHAIN VALIDATORS SYNCED ✓',
    '> AI MEME GENERATOR LOADED ✓',
    '> STONKS MODULE INITIALIZED 🚀',
    '',
    '> WELCOME TO THE MATRIX, MEME TRADER',
    '> CURRENT STATUS: CONNECTED TO THE GRID',
    '> ACTIVE USERS: 1,337 | MEMES TRADED: 42,069',
    '> MARKET CAP: 69,420,000 CREDITS',
    '',
    '> TYPE "help" FOR AVAILABLE COMMANDS',
    '> TIP: Try "stonks" for instant meme generation!',
    '',
  ];

  const commands = {
    help: [
      'AVAILABLE COMMANDS:',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '• gallery - Browse meme collection & leaderboard',
      '• create - Generate new cyberpunk memes',
      '• trading - Access trading dashboard',
      '• stats - View platform statistics',
      '• stonks - Quick stonks meme generator',
      '• matrix - Enter the matrix',
      '• hack - Activate hacker mode',
      '• bid <amount> - Place a bid on trending memes',
      '• clear - Clear terminal',
      '',
      'HACKY FEATURES:',
      '• Placeholder images from picsum.photos',
      '• Mock users: CyberNinja, MemeLord69, TechBro2077',
      '• Real-time leaderboard with top 10 memes',
      '• Negative bids allowed (for demo speed)',
      '• Auto-stonks meme generation',
      '• AI-powered meme captions',
    ],
    stats: [
      'PLATFORM STATISTICS:',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '• Total Memes: 1,337',
      '• Active Traders: 420',
      '• Volume (24h): 69,000 CREDITS',
      '• Top Meme Value: 2,077 CREDITS',
      '• Network Latency: 12ms',
      '• Stonks Memes: 42',
      '• AI Generated: 666',
      '• Highest Bid: 2,500 CR by DiamondHands',
      '• Mock Users Online: CyberNinja, MemeLord69, TechBro2077',
      '• Blockchain Height: 694,200',
      '• Hash Rate: 1.21 GW/s',
    ],
    stonks: [
      '> GENERATING STONKS MEME...',
      '> [████████████████████████████████] 100%',
      '> USING PLACEHOLDER IMAGE: picsum.photos',
      '> TITLE: "Stonks in the Matrix"',
      '> TAGS: stonks, matrix, finance',
      '> PRICE: 2077 CREDITS',
      '> DEPLOYING TO GALLERY...',
      '> SUCCESS: Meme deployed to the blockchain! 🚀',
    ],
    matrix: [
      '> ENTERING THE MATRIX...',
      '> REALITY.EXE HAS STOPPED WORKING',
      '> LOADING CYBERPUNK MEME DIMENSION...',
      '> RED PILL OR BLUE PILL?',
      '> CHOICE: RED PILL SELECTED',
      '> WELCOME TO THE REAL WORLD',
      '> "There is no spoon... only memes" - Morpheus',
    ],
    hack: [
      '> ACTIVATING HACKER MODE...',
      '> BYPASSING FIREWALL... [████████████] 100%',
      '> ACCESS GRANTED TO MAINFRAME',
      '> DOWNLOADING MEME DATABASE...',
      '> [████████████████████████████████] 100%',
      '> HACK SUCCESSFUL! You are now elite hacker! 😎',
      '> WARNING: Use your powers responsibly',
    ],
    bid: [
      '> MOCK BIDDING SYSTEM ACTIVE',
      '> SCANNING FOR TRENDING MEMES...',
      '> PLACING BID ON RANDOM MEME...',
      '> BID AMOUNT: 1500 CREDITS',
      '> BIDDER: CyberNinja',
      '> STATUS: PENDING',
      '> TIP: Use gallery to see real bidding!',
    ],
    gallery: [
      '> ACCESSING MEME GALLERY...',
      '> LOADING LEADERBOARD...',
      '> NEURAL NETWORKS ONLINE...',
      '> REDIRECTING TO GALLERY...'
    ],
    create: [
      '> INITIALIZING MEME GENERATOR...',
      '> AI SYSTEMS ONLINE...',
      '> STONKS MODE READY...',
      '> REDIRECTING TO MEME FORGE...'
    ],
    trading: [
      '> CONNECTING TO TRADING ENGINE...',
      '> MARKET DATA SYNCING...',
      '> REAL-TIME BIDS ACTIVE...',
      '> REDIRECTING TO TRADING NEXUS...'
    ],
    clear: [],
  };

  // Initialize terminal with boot sequence
  useEffect(() => {
    // Start the boot sequence immediately
    const timer = setTimeout(() => {
      setCurrentLine(1);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Real-time typing effect for boot sequence
  useEffect(() => {
    if (currentLine > 0 && currentLine <= bootSequence.length) {
      const timer = setTimeout(() => {
        setHistory(prev => [...prev, bootSequence[currentLine - 1]]);
        
        if (currentLine < bootSequence.length) {
          setCurrentLine(prev => prev + 1);
        } else {
          // Boot sequence complete
          setIsTyping(false);
          setShowPrompt(true);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 100);
        }
      }, currentLine === 3 ? 1500 : 400); // Slower for progress bar

      return () => clearTimeout(timer);
    }
  }, [currentLine, bootSequence.length]);

  const handleCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    const newHistory = [...history, `user@cybermeme:~$ ${cmd}`];

    if (command === 'clear') {
      setHistory([]);
      setCurrentLine(0);
      setIsTyping(true);
      setShowPrompt(false);
      // Restart boot sequence
      setTimeout(() => {
        setCurrentLine(1);
      }, 100);
      return;
    }

    if (commands[command as keyof typeof commands]) {
      const output = commands[command as keyof typeof commands];
      setHistory([...newHistory, ...output, '']);

      // Navigate after showing command output
      if (['gallery', 'create', 'trading'].includes(command)) {
        setTimeout(() => {
          onNavigate(command as any);
        }, 1500);
      }

      // Special actions
      if (command === 'stonks') {
        setTimeout(() => {
          onNavigate('create');
        }, 2000);
      }
    } else if (command === 'exit') {
      onNavigate('gallery');
    } else if (command.startsWith('bid ')) {
      const amount = command.split(' ')[1];
      setHistory([...newHistory, 
        `> PLACING BID: ${amount} CREDITS`,
        '> BIDDER: You',
        '> STATUS: PENDING',
        '> USE GALLERY FOR REAL BIDDING!',
        ''
      ]);
    } else if (command === '') {
      setHistory([...newHistory]);
    } else {
      setHistory([...newHistory, 
        `ERROR: Command "${cmd}" not found.`,
        'Type "help" for available commands.',
        'TIP: Try "stonks" for quick meme generation!',
        ''
      ]);
    }

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Could implement command history here
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black/90 border border-cyber-blue cyber-border rounded-none p-6 font-mono">
        <div className="flex items-center mb-4">
          <Terminal className="w-6 h-6 text-cyber-blue mr-2" />
          <h2 className="text-xl font-orbitron text-cyber-blue glitch-text" data-text="CYBER TERMINAL">
            CYBER TERMINAL
          </h2>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
            <span className="text-xs text-cyber-green">ONLINE</span>
          </div>
        </div>

        <div className="bg-black border border-cyan-400/30 p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-cyan-400">
          {history.map((line, index) => (
            <motion.div
              key={index}
              className={`font-mono text-sm mb-1 ${
                line.startsWith('>') ? 'text-cyber-blue' :
                line.startsWith('ERROR') ? 'text-cyber-pink' :
                line.startsWith('•') ? 'text-cyber-green' :
                line.startsWith('user@') ? 'text-cyber-pink' :
                line.includes('✓') ? 'text-cyber-green' :
                line.includes('🚀') ? 'text-cyber-purple' :
                line.includes('━') ? 'text-gray-500' :
                'text-cyan-400'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              {line}
            </motion.div>
          ))}
          
          {showPrompt && (
            <div className="flex items-center text-cyan-400 font-mono text-sm">
              <span className="text-cyber-pink mr-2">user@cybermeme:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent outline-none caret-cyber-blue terminal-cursor"
                placeholder="Enter command..."
              />
            </div>
          )}

          {isTyping && (
            <div className="flex items-center text-cyan-400 font-mono text-sm">
              <span className="text-cyber-pink mr-2">system@cybermeme:~$</span>
              <span className="animate-pulse">Initializing...</span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { cmd: 'gallery', label: 'GALLERY', icon: '🖼️', color: 'border-cyber-pink' },
            { cmd: 'create', label: 'CREATE', icon: '⚡', color: 'border-cyber-green' },
            { cmd: 'trading', label: 'TRADING', icon: '📈', color: 'border-cyber-purple' },
            { cmd: 'stonks', label: 'STONKS', icon: '🚀', color: 'border-cyber-blue' },
          ].map((item) => (
            <motion.button
              key={item.cmd}
              onClick={() => handleCommand(item.cmd)}
              className={`bg-black/50 border ${item.color} hover:bg-cyber-blue/10 
                         p-3 transition-all duration-300 font-orbitron text-sm 
                         uppercase tracking-wider neon-glow hover:scale-105`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTyping}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 font-mono animate-pulse">
            🎮 CYBERPUNK MEME TRADING PLATFORM | 🚀 STONKS TO THE MOON | 🤖 AI POWERED
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalInterface;