import React, { useState } from 'react';
import GradientBlinds from './GradientBlinds';
import Navbar from './Navbar';
import About from './About';
import SignInModal from './SignInModal'; // Add this import

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isHovered, setIsHovered] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false); // Add this state

  const handleGetStarted = () => {
    setShowSignInModal(true); // Show modal instead of direct redirect
  };

  const handleSignIn = () => {
    setShowSignInModal(false);
    // Redirect to your app after sign in
    window.location.href = 'https://xhafk39x7r8rvjkwli6wbn.streamlit.app/';
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      position: 'relative',
      overflow: currentPage === 'about' ? 'auto' : 'hidden',
      margin: 0,
      padding: 0,
      background: '#000'
    }}>
      <Navbar 
          onNavigate={setCurrentPage} 
          currentPage={currentPage}
          onTryNow={() => setShowSignInModal(true)} // Add this prop
        />

      {/* Add SignInModal here */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
        onSignIn={handleSignIn}
      />

      {currentPage === 'home' && (
        <div style={{ height: '100vh', overflow: 'hidden' }}>
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

          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <h1 style={{
              color: 'white',
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: '1000',
              marginBottom: '2rem',
              textShadow: '0 6px 50px rgba(0,0,0,0.6)',
              letterSpacing: '1.5px',
              pointerEvents: 'auto',
              lineHeight: '1.1',
            }}>
              DocuMind
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
      )}

      {currentPage === 'about' && <About onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;