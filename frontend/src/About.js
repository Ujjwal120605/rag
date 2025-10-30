import React, { useEffect, useRef } from 'react';
import Particles from './Particles';

function About({ onNavigate }) {
  const contentRef = useRef(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh',
      width: '100%',
      background: '#000',
      overflow: 'hidden'
    }}>
      {/* Particles Background - Fixed Position */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <Particles
          particleCount={300}
          particleSpread={15}
          speed={0.05}
          particleColors={['#667eea', '#764ba2', '#b794f6', '#9333ea']}
          alphaParticles={true}
          particleBaseSize={80}
          sizeRandomness={1.5}
          cameraDistance={25}
          disableRotation={false}
        />
      </div>

      {/* Scrollable Content */}
      <div 
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '100px 20px 80px 20px',
        }}
      >
        {/* Hero Section with Slide In Animation */}
        <div 
          className="hero-section"
          style={{
            textAlign: 'center',
            marginBottom: '80px',
            animation: 'slideInDown 0.8s ease-out'
          }}
        >
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: '800',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #b794f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'slideInLeft 1s ease-out'
          }}>
            DocuMind AI
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
            color: '#a0aec0',
            fontWeight: '300',
            maxWidth: '700px',
            margin: '0 auto',
            animation: 'slideInRight 1s ease-out'
          }}>
            Intelligent Document Analysis Powered by Gemini AI
          </p>
        </div>

        {/* Feature Cards with Stagger Animation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          <FeatureCard
            icon="🤖"
            title="AI-Powered Analysis"
            description="Leverages Google's Gemini API for advanced natural language understanding and document comprehension"
            delay="0.2s"
          />
          <FeatureCard
            icon="💬"
            title="Interactive Q&A"
            description="Ask questions about your documents and receive intelligent, context-aware responses instantly"
            delay="0.4s"
          />
          <FeatureCard
            icon="☁️"
            title="Cloud Deployment"
            description="Deployed on Streamlit Cloud for seamless access from anywhere, anytime"
            delay="0.6s"
          />
        </div>

        {/* About Section with Glass Effect */}
        <div 
          className="glass-section"
          style={{
            background: 'rgba(20, 20, 40, 0.7)',
            borderRadius: '25px',
            padding: '60px 50px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            marginBottom: '60px',
            animation: 'fadeInUp 1s ease-out 0.8s both'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            marginBottom: '25px',
            color: '#667eea',
            fontWeight: '700'
          }}>
            About the Project
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: '1.9',
            color: '#cbd5e0',
            marginBottom: '25px'
          }}>
            DocuMind is an advanced document analysis platform that combines the power of artificial intelligence with an intuitive user interface. Built with modern web technologies and integrated with Google's Gemini AI, this application transforms how you interact with documents.
          </p>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            lineHeight: '1.9',
            color: '#cbd5e0'
          }}>
            Whether you need to extract insights, summarize content, or find specific information within large documents, DocuMind provides accurate, context-aware responses powered by state-of-the-art language models.
          </p>
        </div>

        {/* Key Features Section */}
        <div 
          style={{
            background: 'rgba(118, 75, 162, 0.15)',
            borderRadius: '25px',
            padding: '60px 50px',
            border: '1px solid rgba(118, 75, 162, 0.3)',
            backdropFilter: 'blur(15px)',
            marginBottom: '60px',
            animation: 'fadeInUp 1s ease-out 1s both'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            marginBottom: '40px',
            color: '#b794f6',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Key Features
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { icon: '📄', text: 'Upload multiple document formats' },
              { icon: '🔍', text: 'Natural language question answering' },
              { icon: '🎯', text: 'Context-aware AI responses' },
              { icon: '⚡', text: 'Real-time document processing' },
              { icon: '🔒', text: 'Secure document handling' },
              { icon: '🎨', text: 'Responsive interface' }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  animation: `slideInLeft 0.6s ease-out ${0.2 + index * 0.1}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(10px)';
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <span style={{ fontSize: '2rem', marginRight: '15px' }}>
                  {feature.icon}
                </span>
                <span style={{ 
                  fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', 
                  color: '#cbd5e0',
                  fontWeight: '400'
                }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          animation: 'fadeInUp 1s ease-out 1.2s both'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#e2e8f0',
            marginBottom: '30px',
            fontWeight: '600'
          }}>
            Ready to Transform Your Document Workflow?
          </h3>
          <button
            onClick={() => onNavigate('home')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '18px 50px',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px) scale(1.05)';
              e.target.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
            }}
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Inline Animations */}
      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '20px',
      padding: '40px 30px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      animation: `fadeInUp 0.8s ease-out ${delay} both`
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
      e.currentTarget.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{
        fontSize: '4rem',
        marginBottom: '25px',
        textAlign: 'center',
        filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
        marginBottom: '18px',
        color: '#e2e8f0',
        textAlign: 'center',
        fontWeight: '700'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
        lineHeight: '1.7',
        color: '#a0aec0',
        textAlign: 'center'
      }}>
        {description}
      </p>
    </div>
  );
}

export default About;