import { Send, Sparkles, MessageSquare, RefreshCw, Smartphone, Bot } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
// import { ChatMessage } from '../types';

// interface AiStylistProps {
//   cartCount: number;
// }

export default function AiStylist({ cartCount }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: "Hey There! Thanks for shopping with us at Hoodie. I am your personal AI Streetwear Stylist. Need advice on sizing, streetwear pairings, or our Fall/Winter 23 Limited Editions?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: userText,
          cartCount: cartCount
        }),
      });

      if (!response.ok) {
        throw new Error('API communication error');
      }

      const data = await response.json();
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || "I apologize, but I couldn't process that. Feel free to ask about our hoodies size guide, streetwear styling, caps, or bags!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      // Graceful fallback for preview testing (e.g. key missing fallback)
      setTimeout(() => {
        let fallbackReply = "That's a dope styled question! Our Streetwear Cyberpunk features a boxy oversized fit. ";
        if (userText.toLowerCase().includes('size') || userText.toLowerCase().includes('ukuran')) {
          fallbackReply += "Normally, our items fit true-to-size for an oversized drop shoulder aesthetic. If you prefer a tight fit, consider stepping down one level.";
        } else if (userText.toLowerCase().includes('sneaker') || userText.toLowerCase().includes('sepatu')) {
          fallbackReply += "The Sneaker NY JDR ($35.20) pairs perfectly with our Windbreaker Miegaña and cropped utility cargos.";
        } else {
          fallbackReply += "Try styling with our custom Messenger Accessory Bag or a raw hem layering tee to complete the look!";
        }
        
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: fallbackReply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Launcher Bubble */}
      <button 
        id="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-neutral-900 border border-neutral-800 text-white p-4 rounded-full shadow-2xl hover:bg-neutral-800 active:scale-95 hover:scale-105 transition duration-300 flex items-center justify-center gap-2 group"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D3E35] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#425d4f]"></span>
        </span>
        <div className="relative">
          <Bot className="h-6 w-6 text-white group-hover:rotate-6 transition duration-300" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-sans font-medium text-xs tracking-wider whitespace-nowrap">
          AI STYLIST CHAT
        </span>
      </button>

      {/* Styled Chat Panel overlay */}
      {isOpen && (
        <div 
          id="chat-panel"
          className="fixed bottom-24 right-6 z-40 w-full max-w-sm h-[500px] bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#2D3E35]/30 border border-[#2D3E35] rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#EAE5D8]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm leading-tight text-white flex items-center gap-1.5">
                  AI Cyber Stylist
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[10px] text-neutral-400 font-mono tracking-wide uppercase">STREETWEAR ENGINE V2.5</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white font-mono text-xs scale-90 bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded"
            >
              CLOSE
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-[#2D3E35]/20 border-b border-neutral-800/60 px-4 py-2 flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-neutral-300" />
            <span className="text-[10px] text-neutral-300 font-sans tracking-wide leading-none">
              Trained on premium loopbacks & bag fit dimensions.
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/40">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 bg-[#2D3E35] rounded-full flex items-center justify-center shrink-0 self-start mt-0.5">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                )}
                <div 
                  className={`rounded-2xl p-3.5 text-xs inline-block leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#2D3E35] text-white rounded-tr-none' 
                      : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-6 h-6 bg-[#2D3E35] rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-white animate-spin" />
                </div>
                <div className="bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1.5 font-mono">
                  <span>Styling answer</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: '200ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '400ms' }}>.</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          <div className="p-2 border-t border-neutral-800/65 bg-neutral-950/60 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
            {[
              "What size hoodie should I buy?",
              "Recommend top combinations",
              "How to clean heavy cotton?"
            ].map((s, idx) => (
              <button 
                key={idx}
                onClick={() => selectSuggestion(s)}
                className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 rounded-full px-3 py-1 transition duration-200"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-neutral-900 border-t border-neutral-800 flex gap-2"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Stylist model..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#2D3E35] placeholder-neutral-500 font-sans"
            />
            <button 
              type="submit"
              className="bg-[#2D3E35] text-white hover:bg-[#3d5348] border border-neutral-800/50 p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
