import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Sparkles, Brain, Zap, ArrowLeft } from 'lucide-react';
import { useMemes } from '../context/MemeContext';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface CreateMemeProps {
  onNavigate: (view: 'terminal' | 'gallery' | 'create' | 'trading') => void;
}

const CreateMeme: React.FC<CreateMemeProps> = ({ onNavigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createMeme } = useMemes();
  const { user, profile, isAuthenticated, loading } = useAuth();

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Zap className="w-12 h-12 text-cyber-blue animate-pulse mx-auto mb-4" />
          <p className="text-cyber-blue font-orbitron">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  // Show access denied only if we're sure there's no authenticated user
  if (!isAuthenticated) {
    return (
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-black/80 border border-cyber-pink/50 p-8">
          <h2 className="text-2xl font-orbitron font-bold text-cyber-pink mb-4">
            ACCESS DENIED
          </h2>
          <p className="text-cyan-400 mb-6">
            You must be logged in to access the meme creation laboratory.
          </p>
          <motion.button
            onClick={() => onNavigate('terminal')}
            className="bg-cyber-blue/20 text-cyber-blue border border-cyber-blue
                       px-6 py-3 font-orbitron font-bold hover:bg-cyber-blue/30 
                       transition-all duration-300 neon-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            RETURN TO TERMINAL
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Use placeholder image for demo
      toast.success('Image uploaded! Using placeholder for demo.');
      setImageUrl(`https://picsum.photos/800/600?random=${Date.now()}`);
    }
  };

  const generateRandomMeme = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const memeIdeas = [
      { 
        title: 'When the blockchain validates your meme', 
        tags: 'crypto, blockchain, success',
        description: 'That feeling when your meme gets verified on the blockchain'
      },
      { 
        title: 'AI trying to understand human humor', 
        tags: 'ai, robots, confusion',
        description: 'Neural networks attempting to decode the mysteries of comedy'
      },
      { 
        title: 'Cyberpunk cat judges your code', 
        tags: 'cyberpunk, cats, programming',
        description: 'When your feline overlord reviews your latest commit'
      },
      { 
        title: 'Neural networks dreaming of electric sheep', 
        tags: 'ai, dreams, scifi',
        description: 'What happens when AI sleeps and dreams of Philip K. Dick'
      },
      { 
        title: 'When your smart contract actually works', 
        tags: 'crypto, success, celebration',
        description: 'The rare moment when your DeFi code executes flawlessly'
      },
      {
        title: 'Stonks in the Matrix',
        tags: 'stonks, matrix, finance',
        description: 'To the moon! 🚀'
      }
    ];
    
    const randomMeme = memeIdeas[Math.floor(Math.random() * memeIdeas.length)];
    setTitle(randomMeme.title);
    setDescription(randomMeme.description);
    setTags(randomMeme.tags);
    // Default stonks image if no image provided
    setImageUrl('https://picsum.photos/800/600?random=stonks');
    setIsGenerating(false);
    
    toast.success('AI meme generated successfully! 🤖');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast.error('Please provide a title!');
      return;
    }

    // Use default stonks image if no image provided
    const finalImageUrl = imageUrl || 'https://picsum.photos/800/600?random=stonks';

    const result = await createMeme({
      title,
      image_url: finalImageUrl,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      description: description || undefined,
      price,
    });

    if (result.success) {
      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
      setImageUrl('');
      setPrice(100);
      
      // Navigate back to gallery
      setTimeout(() => onNavigate('gallery'), 1000);
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center">
        <motion.button
          onClick={() => onNavigate('gallery')}
          className="inline-flex items-center space-x-2 text-cyber-blue hover:text-cyber-pink 
                     transition-colors duration-300 mb-4"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-orbitron">BACK TO GALLERY</span>
        </motion.button>
        
        <h1 className="text-4xl font-orbitron font-bold text-cyber-green glitch-text mb-4" data-text="MEME FORGE">
          MEME FORGE
        </h1>
        <p className="text-cyan-400/80">Neural-enhanced meme creation laboratory</p>
        
        {/* User Status */}
        <div className="mt-4 text-sm text-cyber-blue">
          Welcome, {profile?.username || user?.email?.split('@')[0] || 'Cyber Warrior'}! 
          <span className="text-cyber-green ml-2">
            {profile?.credits || 1000} CREDITS AVAILABLE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Panel - AI Generator */}
        <div className="xl:col-span-1 space-y-6">
          {/* AI Generation */}
          <div className="bg-black/80 border border-cyber-green/50 p-6">
            <h3 className="text-xl font-orbitron text-cyber-green mb-4 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              AI GENERATOR
            </h3>
            
            <motion.button
              onClick={generateRandomMeme}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 
                         border border-cyber-green hover:border-cyber-blue
                         py-4 px-6 font-orbitron font-bold text-cyber-green
                         hover:text-cyber-blue transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         neon-glow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-5 h-5 animate-spin" />
                  <span>NEURAL PROCESSING...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>GENERATE AI MEME</span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Upload Area */}
          <div className="bg-black/80 border border-cyber-blue/50 p-6">
            <h3 className="text-xl font-orbitron text-cyber-blue mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2" />
              IMAGE UPLOAD
            </h3>
            
            <div
              className={`border-2 border-dashed p-6 text-center transition-all duration-300
                ${dragActive 
                  ? 'border-cyber-blue bg-cyber-blue/10' 
                  : 'border-gray-600 hover:border-cyber-blue/50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Image className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 mb-2 text-sm">Drag & drop your image here</p>
              <p className="text-xs text-gray-600 mb-4">or use placeholder images</p>
              
              <div className="space-y-2">
                <motion.button
                  onClick={() => setImageUrl(`https://picsum.photos/800/600?random=${Date.now()}`)}
                  className="w-full bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50
                             px-4 py-2 text-sm font-orbitron hover:bg-cyber-blue/30 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  RANDOM IMAGE
                </motion.button>

                <motion.button
                  onClick={() => setImageUrl('https://picsum.photos/800/600?random=stonks')}
                  className="w-full bg-cyber-green/20 text-cyber-green border border-cyber-green/50
                             px-4 py-2 text-sm font-orbitron hover:bg-cyber-green/30 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  STONKS MEME
                </motion.button>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">OR ENTER IMAGE URL:</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-black/80 border border-gray-600 focus:border-cyber-blue
                           p-3 text-cyan-400 placeholder-gray-500 font-mono text-sm
                           focus:outline-none transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Center Panel - Form */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-black/80 border border-cyber-pink/50 p-6 space-y-6">
            <h3 className="text-xl font-orbitron text-cyber-pink mb-4">MEME METADATA</h3>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-orbitron">TITLE:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter meme title..."
                className="w-full bg-black/80 border border-gray-600 focus:border-cyber-pink
                           p-3 text-cyan-400 placeholder-gray-500 font-orbitron
                           focus:outline-none transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-orbitron">DESCRIPTION:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your meme..."
                rows={4}
                className="w-full bg-black/80 border border-gray-600 focus:border-cyber-pink
                           p-3 text-cyan-400 placeholder-gray-500 font-mono
                           focus:outline-none transition-all duration-300 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-orbitron">TAGS (comma separated):</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="funny, crypto, ai, cyberpunk..."
                className="w-full bg-black/80 border border-gray-600 focus:border-cyber-pink
                           p-3 text-cyan-400 placeholder-gray-500 font-mono
                           focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-orbitron">STARTING PRICE (CREDITS):</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={1}
                className="w-full bg-black/80 border border-gray-600 focus:border-cyber-pink
                           p-3 text-cyan-400 placeholder-gray-500 font-mono
                           focus:outline-none transition-all duration-300"
              />
            </div>
            
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-cyber-pink/20 to-cyber-purple/20
                         border border-cyber-pink hover:border-cyber-purple
                         py-4 px-6 font-orbitron font-bold text-cyber-pink
                         hover:text-cyber-purple transition-all duration-300
                         neon-glow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>DEPLOY MEME</span>
              </div>
            </motion.button>
          </form>
        </div>

        {/* Right Panel - Preview */}
        <div className="xl:col-span-1">
          <div className="bg-black/80 border border-cyan-400/50 p-6 sticky top-8">
            <h3 className="text-xl font-orbitron text-cyan-400 mb-4">PREVIEW</h3>
            
            {imageUrl || title ? (
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden border border-gray-600">
                  <img
                    src={imageUrl || 'https://picsum.photos/800/600?random=stonks'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {title && (
                  <div className="p-4 bg-black/60 border border-gray-700">
                    <h4 className="font-orbitron font-bold text-cyan-400 mb-2">{title}</h4>
                    {description && (
                      <p className="text-sm text-gray-400 mb-3">{description}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-cyber-blue font-mono font-bold">{price} CREDITS</span>
                      <span className="text-xs text-gray-500">Starting Price</span>
                    </div>
                    {tags && (
                      <div className="flex flex-wrap gap-2">
                        {tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-cyber-blue/20 text-cyber-blue px-2 py-1 
                                       font-mono border border-cyber-blue/30"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square border-2 border-dashed border-gray-600 
                              flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto mb-4" />
                  <p>No preview available</p>
                  <p className="text-sm">Add a title or image to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateMeme;