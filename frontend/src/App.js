import React, { useState } from 'react';
import GradientBlinds from './GradientBlinds';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleGetStarted = () => {
    window.location.href = 'https://xhafk39x7r8rvjkwli6wbn.streamlit.app/';
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      background: '#000'
    }}>
      {/* Your GradientBlinds - completely untouched */}
      <GradientBlinds
    gradientColors={['#FF9FFC', '#5227FF']}
    angle={0}
    noise={0.3}
    blindCount={12}
    blindMinWidth={50}
    spotlightRadius={0.5}
    spotlightSoftness={1}
    spotlightOpacity={1}
    mouseDampening={0.15}
    distortAmount={0}
    shineDirection="left"
    mixBlendMode="lighten"
  />
      
      {/* Overlay content - won't affect GradientBlinds */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        textAlign: 'center',
        pointerEvents: 'none' // Allows interactions to pass through
      }}>
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '800',
          marginBottom: '1.5rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          pointerEvents: 'auto'
        }}>
          AI based Document Analyser
          
        </h1>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 'clamp(1rem, 2vw, 1.3rem)',
          marginBottom: '2.5rem',
          fontWeight: '300',
          pointerEvents: 'auto'
        }}>
          Extract insights from your documents with advanced ML algorithms
        </p>
        
        <button
          onClick={handleGetStarted}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            padding: '15px 45px',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#fff',
            background: isHovered 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            boxShadow: isHovered 
              ? '0 10px 30px rgba(102, 126, 234, 0.5)'
              : '0 4px 15px rgba(0,0,0,0.2)',
            pointerEvents: 'auto'
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;