import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- CUSTOM ANIMATIONS (The Hover and Drawing Effects) ---
const globalStyles = `
  @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
  @keyframes float-medium { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
  @keyframes draw-line { to { stroke-dashoffset: 0; } }
  @keyframes march-ants { to { stroke-dashoffset: -20; } }
`;

// --- THE ANIMATED GRAPH BACKGROUND ---
const CanvasDAGBackground = ({ vibrant }) => {
  const strokeColor = vibrant ? "url(#neon-gradient)" : "#222222";
  const fillColor = vibrant ? "#0a0b10" : "#050505";
  const nodeGlow = vibrant ? "drop-shadow(0px 0px 15px rgba(59,130,246,0.4))" : "none";
  const lineOpacity = vibrant ? "0.8" : "0.2";

  return (
    <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      <g opacity={lineOpacity} style={{ animation: 'draw-line 4s ease-out forwards' }} strokeDasharray="1500" strokeDashoffset="1500">
        <path d="M 250 200 C 400 200, 350 400, 500 400" fill="none" stroke={strokeColor} strokeWidth="2" />
        <path d="M 200 600 C 350 600, 350 400, 500 400" fill="none" stroke={strokeColor} strokeWidth="2" />
        <path d="M 700 400 C 850 400, 850 250, 1000 250" fill="none" stroke={strokeColor} strokeWidth="2" />
      </g>

      <g style={{ animation: 'float-slow 6s ease-in-out infinite' }}>
        <rect x="100" y="160" width="150" height="80" rx="12" fill={fillColor} stroke={strokeColor} strokeWidth="2" style={{ filter: nodeGlow }} />
        <circle cx="130" cy="200" r="10" fill={strokeColor} opacity="0.5" />
      </g>

      <g style={{ animation: 'float-slow 8s ease-in-out infinite' }}>
        <rect x="500" y="320" width="200" height="160" rx="16" fill={fillColor} stroke={strokeColor} strokeWidth="2" style={{ filter: nodeGlow }} />
      </g>

      <g style={{ animation: 'float-slow 9s ease-in-out infinite' }}>
        <rect x="850" y="550" width="200" height="150" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="8 8" style={vibrant ? { animation: 'march-ants 1s linear infinite' } : {}} />
        <path d="M 1050 700 L 1065 725 L 1055 725 L 1065 745 L 1055 750 L 1045 730 L 1035 740 Z" fill={vibrant ? "#3b82f6" : "#333"} />
      </g>
    </svg>
  );
};


export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  

  const navigate = useNavigate();    // It forces the Address Bar to change without reloading the page.

  const handleCreateBoard = () => {

    // Generate the Token and switch the page!
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate('/board/' + newRoomId);
    
  };

  const layerStyle = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none', userSelect: 'none'
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#050505', overflow: 'hidden', fontFamily: 'sans-serif', cursor: 'crosshair' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{globalStyles}</style>

      {/* LAYER 1: THE DULL BASE */}
      <div style={{ ...layerStyle, zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <CanvasDAGBackground vibrant={false} />
        
        <h1 style={{ fontSize: '5rem', fontWeight: 800, letterSpacing: '-2px', color: '#222', margin: 0, zIndex: 10 }}>
          Infinite Canvas
        </h1>
        <p style={{ marginTop: '24px', fontSize: '1.25rem', color: '#333', maxWidth: '500px', textAlign: 'center', zIndex: 10 }}>
          Collaborative real-time drawing for teams. No sign-up required.
        </p>
      </div>

      {/* LAYER 2: THE MAGIC FLASHLIGHT REVEAL */}
      <div style={{
          ...layerStyle, zIndex: 20,
          WebkitMaskImage: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, black 10%, transparent 100%)`,
          maskImage: `radial-gradient(circle 350px at ${mousePosition.x}px ${mousePosition.y}px, black 10%, transparent 100%)`,
          opacity: isHovered ? 1 : 0, transition: 'opacity 0.5s ease',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to right, #1e3a8a 1px, transparent 1px), linear-gradient(to bottom, #4c1d95 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }}></div>
        <CanvasDAGBackground vibrant={true} />
        
        <h1 style={{ fontSize: '5rem', fontWeight: 800, letterSpacing: '-2px', margin: 0, zIndex: 10, background: 'linear-gradient(to right, #60a5fa, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.5))' }}>
          Infinite Canvas
        </h1>
        <p style={{ marginTop: '24px', fontSize: '1.25rem', color: '#dbeafe', maxWidth: '500px', textAlign: 'center', zIndex: 10 }}>
          Collaborative real-time drawing for teams. No sign-up required.
        </p>
      </div>

      {/* LAYER 3: THE BUTTON (Clickable) */}
      <div style={{ ...layerStyle, zIndex: 30, marginTop: '300px' }}>
        <button 
          onClick={handleCreateBoard}
          style={{ 
            pointerEvents: 'auto', 
            padding: '16px 32px', 
            backgroundColor: 'white', 
            color: 'black', 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            borderRadius: '9999px', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            boxShadow: '0 0 40px rgba(255,255,255,0.2)' 
          }}
        >
          Create New Board →
        </button>
      </div>

    </div>
  );
}