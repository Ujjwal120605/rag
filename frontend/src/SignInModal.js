import React, { useState, useEffect } from 'react';

function SignInModal({ isOpen, onClose, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Store users in memory (in production, this would be a backend database)
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('documind_users');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    // Save users to localStorage whenever it changes
    localStorage.setItem('documind_users', JSON.stringify(users));
  }, [users]);

  if (!isOpen) return null;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSignUp = () => {
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      setError('An account with this email already exists. Please sign in.');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase(),
      password: password, // In production, this should be hashed!
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    
    // Store current user session
    localStorage.setItem('documind_current_user', JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }));

    setError('');
    setTimeout(() => {
      onSignIn();
    }, 500);
  };

  const handleSignIn = () => {
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      setError('No account found with this email. Please sign up first.');
      return;
    }

    if (user.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Store current user session
    localStorage.setItem('documind_current_user', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }));

    setError('');
    setTimeout(() => {
      onSignIn();
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (isSignUp) {
        handleSignUp();
      } else {
        handleSignIn();
      }
      setLoading(false);
    }, 500);
  };

  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);
    
    // Simulate OAuth flow
    setTimeout(() => {
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        provider: 'google',
        createdAt: new Date().toISOString()
      };

      // Check if user exists
      const existingUser = users.find(u => u.email === mockGoogleUser.email);
      if (!existingUser) {
        setUsers([...users, mockGoogleUser]);
      }

      localStorage.setItem('documind_current_user', JSON.stringify({
        id: mockGoogleUser.id,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        provider: 'google'
      }));

      setLoading(false);
      onSignIn();
    }, 1000);
  };

  const handleGitHubSignIn = () => {
    setError('');
    setLoading(true);
    
    // Simulate OAuth flow
    setTimeout(() => {
      const mockGitHubUser = {
        id: 'github_' + Date.now(),
        name: 'GitHub User',
        email: 'user@github.com',
        provider: 'github',
        createdAt: new Date().toISOString()
      };

      // Check if user exists
      const existingUser = users.find(u => u.email === mockGitHubUser.email);
      if (!existingUser) {
        setUsers([...users, mockGitHubUser]);
      }

      localStorage.setItem('documind_current_user', JSON.stringify({
        id: mockGitHubUser.id,
        name: mockGitHubUser.name,
        email: mockGitHubUser.email,
        provider: 'github'
      }));

      setLoading(false);
      onSignIn();
    }, 1000);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }}
    onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.5rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          ×
        </button>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{
            color: '#fff',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem'
          }}>
            {isSignUp ? 'Sign up to get started with DocuMind' : 'Sign in to continue to DocuMind'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.8rem 1rem',
            marginBottom: '1.2rem',
            color: '#ef4444',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isSignUp && (
            <div>
              <label style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.border = '1px solid rgba(102, 126, 234, 0.5)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.border = '1px solid rgba(102, 126, 234, 0.5)';
                }
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.border = '1px solid rgba(102, 126, 234, 0.5)';
                }
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              }}
            />
            {isSignUp && (
              <p style={{
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '0.4rem'
              }}>
                Must be at least 6 characters
              </p>
            )}
          </div>

          {!isSignUp && (
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setError('Password reset functionality would be implemented here');
                }}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(102, 126, 234, 0.9)',
                  fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  transition: 'color 0.2s ease',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.color = '#667eea')}
                onMouseLeave={(e) => (e.target.style.color = 'rgba(102, 126, 234, 0.9)')}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading 
                ? 'rgba(102, 126, 234, 0.5)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Processing...
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </div>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.95rem'
        }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={toggleMode}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              padding: 0,
              transition: 'color 0.2s ease',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => !loading && (e.target.style.color = '#764ba2')}
            onMouseLeave={(e) => (e.target.style.color = '#667eea')}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            Or continue with
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.8rem'
          }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                padding: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              style={{
                padding: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>

        <style>
          {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default SignInModal;