import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, Zap, Target } from 'lucide-react';

const TradingDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState({
    totalVolume: 1250000,
    activeTrades: 342,
    topMemePrice: 15000,
    marketCap: 50000000,
  });

  const [recentTrades, setRecentTrades] = useState([
    { id: 1, meme: 'Doge HODL Master', price: 1200, change: 15.2, time: '2m ago' },
    { id: 2, meme: 'AI Cat Confusion', price: 850, change: -8.1, time: '5m ago' },
    { id: 3, meme: 'Blockchain Victory', price: 2100, change: 22.5, time: '7m ago' },
    { id: 4, meme: 'Crypto Winter Vibes', price: 650, change: -12.3, time: '12m ago' },
    { id: 5, meme: 'Neural Network Dreams', price: 1800, change: 9.7, time: '15m ago' },
  ]);

  const [topMemes, setTopMemes] = useState([
    { id: 1, name: 'Quantum Meme Lord', price: 15000, change: 45.2, volume: '250K' },
    { id: 2, name: 'Cyberpunk Doggo', price: 12500, change: 32.1, volume: '180K' },
    { id: 3, name: 'AI Overlord Laughs', price: 9800, change: -15.3, volume: '320K' },
    { id: 4, name: 'Matrix Cat Glitch', price: 8200, change: 18.7, volume: '150K' },
    { id: 5, name: 'Neon Genesis Meme', price: 7650, change: -8.2, volume: '200K' },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentTrades(prev => 
        prev.map(trade => ({
          ...trade,
          price: trade.price + (Math.random() - 0.5) * 100,
          change: trade.change + (Math.random() - 0.5) * 5,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-orbitron font-bold text-cyber-purple glitch-text mb-4" data-text="TRADING NEXUS">
          TRADING NEXUS
        </h1>
        <p className="text-cyan-400/80">Real-time meme market dynamics</p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { 
            icon: DollarSign, 
            label: 'Total Volume (24h)', 
            value: `${(marketData.totalVolume / 1000000).toFixed(2)}M CR`, 
            change: 12.5,
            color: 'text-cyber-blue' 
          },
          { 
            icon: Activity, 
            label: 'Active Trades', 
            value: marketData.activeTrades.toLocaleString(), 
            change: 8.3,
            color: 'text-cyber-green' 
          },
          { 
            icon: TrendingUp, 
            label: 'Top Meme Price', 
            value: `${(marketData.topMemePrice / 1000).toFixed(1)}K CR`, 
            change: 25.7,
            color: 'text-cyber-pink' 
          },
          { 
            icon: Target, 
            label: 'Market Cap', 
            value: `${(marketData.marketCap / 1000000).toFixed(0)}M CR`, 
            change: 15.2,
            color: 'text-cyber-purple' 
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-black/60 border border-gray-600 hover:border-cyan-400/50 
                       p-6 text-center transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color} group-hover:animate-pulse`} />
            <div className={`text-2xl font-orbitron font-bold ${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400 uppercase mb-2">{stat.label}</div>
            <div className={`text-sm flex items-center justify-center space-x-1 
              ${stat.change > 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
              {stat.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(stat.change).toFixed(1)}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Trades */}
        <motion.div
          className="bg-black/80 border border-cyber-green/50 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-orbitron text-cyber-green mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-2" />
            RECENT TRADES
            <div className="ml-auto w-2 h-2 bg-cyber-green rounded-full animate-pulse" />
          </h3>
          
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <motion.div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-black/40 border border-gray-700
                           hover:border-cyber-green/30 transition-all duration-300"
                whileHover={{ x: 5 }}
              >
                <div className="flex-1">
                  <div className="font-orbitron text-cyan-400 text-sm">{trade.meme}</div>
                  <div className="text-xs text-gray-400">{trade.time}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-cyber-blue">{Math.floor(trade.price)} CR</div>
                  <div className={`text-xs flex items-center justify-end space-x-1
                    ${trade.change > 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                    {trade.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(trade.change).toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Memes */}
        <motion.div
          className="bg-black/80 border border-cyber-pink/50 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-orbitron text-cyber-pink mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            TOP PERFORMERS
          </h3>
          
          <div className="space-y-3">
            {topMemes.map((meme, index) => (
              <motion.div
                key={meme.id}
                className="flex items-center justify-between p-4 bg-black/40 border border-gray-700
                           hover:border-cyber-pink/30 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-orbitron font-bold
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      index === 1 ? 'bg-gray-500/20 text-gray-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-600/20 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  
                  <div>
                    <div className="font-orbitron text-cyan-400 text-sm group-hover:text-cyber-pink transition-colors">
                      {meme.name}
                    </div>
                    <div className="text-xs text-gray-400">Vol: {meme.volume}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-cyber-blue">{meme.price.toLocaleString()} CR</div>
                  <div className={`text-xs flex items-center justify-end space-x-1
                    ${meme.change > 0 ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                    {meme.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(meme.change).toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trading Actions */}
      <motion.div
        className="bg-black/80 border border-cyber-blue/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-orbitron text-cyber-blue mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-2" />
          QUICK ACTIONS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'AUTO-TRADE', color: 'cyber-green', desc: 'AI-powered trading bot' },
            { label: 'PORTFOLIO', color: 'cyber-blue', desc: 'View your holdings' },
            { label: 'ANALYTICS', color: 'cyber-purple', desc: 'Market insights & trends' },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              className={`bg-${action.color}/20 border border-${action.color}/50 
                         hover:border-${action.color} hover:bg-${action.color}/30
                         p-6 text-center transition-all duration-300 group neon-glow`}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`text-${action.color} font-orbitron font-bold text-lg mb-2`}>
                {action.label}
              </div>
              <div className="text-gray-400 text-sm">{action.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TradingDashboard;