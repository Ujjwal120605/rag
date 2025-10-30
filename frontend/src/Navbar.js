// Navbar.jsx
import React from 'react';

function Navbar({ onNavigate, currentPage }) {
  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'About', page: 'about' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: 'auto',
      maxWidth: '90%'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '50px',
        padding: '0.8rem 2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem'
      }}>
        <div 
          onClick={() => onNavigate('home')}
          style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'white',
            letterSpacing: '0.5px',
            cursor: 'pointer'
          }}>
          DocuMind
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          {navLinks.map((link, index) => (
            <div
              key={index}
              onClick={() => onNavigate(link.page)}
              style={{
                color: currentPage === link.page ? '#fff' : 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: currentPage === link.page ? '600' : '500',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                padding: '0.5rem 0',
                borderBottom: currentPage === link.page ? '2px solid #fff' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#fff';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== link.page) {
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                }
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {link.name}
            </div>
          ))}
        </div>

        <button
          onClick={() => window.open('https://xhafk39x7r8rvjkwli6wbn.streamlit.app/', '_blank')}
          style={{
            padding: '0.7rem 1.8rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#fff',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          Try Now
        </button>
      </div>
    </nav>
  );
}

export default Navbar;