import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Rocket, Zap } from 'lucide-react';
import Toast from '../components/Toast';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        
        setToast({ message: 'Account created! Please sign in.', type: 'success' });
        setIsSignUp(false);
        setPassword('');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Automatically redirect admin to /admin, others to /dashboard
        if (email.toLowerCase() === 'anilkumarkondeboina@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setToast({ message: error.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <Rocket size={60} color="var(--primary-orange)" />
          </div>
          <h1 style={styles.title}>72-Hour Hackathon</h1>
          <p style={styles.subtitle}>
            <Zap size={20} style={{verticalAlign: 'middle'}} /> Build. Debate. Win.
          </p>
          <p style={styles.org}>Organized by Coding Club – SV University</p>
        </div>

        <div style={styles.card} className="glass-card">
          <h2 style={styles.cardTitle}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p style={styles.cardSubtitle}>
            {isSignUp 
              ? 'Register to participate in the hackathon' 
              : 'Welcome back! Sign in to continue'
            }
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {isSignUp && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input"
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">
                <Mail size={16} style={{verticalAlign: 'middle', marginRight: '0.5rem'}} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <Lock size={16} style={{verticalAlign: 'middle', marginRight: '0.5rem'}} />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{width: '100%', marginTop: '1rem'}}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={styles.toggle}>
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => setIsSignUp(false)} 
                  style={styles.toggleBtn}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsSignUp(true)} 
                  style={styles.toggleBtn}
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>

        <div style={styles.features}>
          <FeatureCard 
            icon={<Zap size={24} />}
            title="72 Hours"
            description="Build your project in 3 days"
          />
          <FeatureCard 
            icon={<Rocket size={24} />}
            title="Team of 3"
            description="Collaborate with your peers"
          />
          <FeatureCard 
            icon={<Mail size={24} />}
            title="Real Problems"
            description="Solve real-world challenges"
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div style={featureStyles.card} className="glass-card">
    <div style={featureStyles.icon}>{icon}</div>
    <h4 style={featureStyles.title}>{title}</h4>
    <p style={featureStyles.description}>{description}</p>
  </div>
);

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  container: {
    width: '100%',
    maxWidth: '500px',
    padding: '0 0.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  iconContainer: {
    display: 'inline-block',
    padding: '1.5rem',
    background: 'var(--glass-bg)',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  title: {
    fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
    color: 'white',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
  },
  org: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  card: {
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
  },
  cardSubtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  form: {
    width: '100%',
  },
  toggle: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'var(--text-secondary)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-purple)',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
};

const featureStyles = {
  card: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
  },
  icon: {
    color: 'var(--accent-purple)',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  description: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
};

export default SignIn;
