import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Rocket } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <Rocket size={28} />
          <span>72Hr Hackathon</span>
        </Link>

        {user && (
          <div style={styles.navLinks}>
            {isAdmin ? (
              <Link to="/admin" style={styles.link}>
                Admin Dashboard
              </Link>
            ) : (
              <Link to="/dashboard" style={styles.link}>
                Dashboard
              </Link>
            )}
            <button onClick={handleSignOut} style={styles.logoutBtn}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--glass-border)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    transition: 'transform var(--transition-fast)',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color var(--transition-fast)',
    cursor: 'pointer',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1.25rem',
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--text-primary)',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--transition-normal)',
  },
};

export default Navbar;
