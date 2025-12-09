import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, User, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const TeamRegistration = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderRollNo, setLeaderRollNo] = useState('');
  const [teammate1RollNo, setTeammate1RollNo] = useState('');
  const [teammate2RollNo, setTeammate2RollNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    checkExistingTeam();
  }, [user, isAdmin]);

  const checkExistingTeam = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // User already has a team, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking existing team:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all roll numbers are unique within the team
      const rollNumbers = [leaderRollNo, teammate1RollNo, teammate2RollNo].filter(r => r);
      const uniqueRollNumbers = new Set(rollNumbers);
      
      if (uniqueRollNumbers.size !== rollNumbers.length) {
        throw new Error('All roll numbers must be unique within the team');
      }

      // Call RPC function to register team
      const { data, error } = await supabase.rpc('register_team', {
        p_team_name: teamName,
        p_leader_name: leaderName,
        p_leader_roll: leaderRollNo.toUpperCase(),
        p_member1_roll: teammate1RollNo ? teammate1RollNo.toUpperCase() : null,
        p_member2_roll: teammate2RollNo ? teammate2RollNo.toUpperCase() : null
      });

      if (error) throw error;

      setToast({ message: 'Team registered successfully!', type: 'success' });
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      let message = error.message || 'Registration failed';
      if (message.includes('Duplicate roll number')) {
        message = 'One or more roll numbers are already registered in another team';
      } else if (message.includes('already created a team')) {
        message = 'You have already created a team';
      } else if (message.includes('unique')) {
        message = 'Team name or roll number already exists';
      }
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <>
      <Navbar />
      <div style={styles.page} className="page fade-in">
        <div style={styles.container}>
          <div className="page-header">
            <div style={styles.iconContainer} className="glow">
              <Users size={50} />
            </div>
            <h1 className="page-title">Register Your Team</h1>
            <p className="page-subtitle">
              Form your team of 3 members to participate in the hackathon
            </p>
          </div>

          <div style={styles.card} className="glass-card">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">
                  <Trophy size={16} style={{verticalAlign: 'middle', marginRight: '0.5rem'}} />
                  Team Name
                </label>
                <input
                  type="text"
                  placeholder="Enter a unique team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Team Leader</h3>
                
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Leader's full name"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">
                    <User size={16} style={{verticalAlign: 'middle', marginRight: '0.5rem'}} />
                    Roll Number
                  </label>
                  <input
                    type="text"
                    placeholder="Leader's roll number"
                    value={leaderRollNo}
                    onChange={(e) => setLeaderRollNo(e.target.value.toUpperCase())}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Team Members</h3>
                
                <div className="input-group">
                  <label className="input-label">Teammate 1 Roll Number</label>
                  <input
                    type="text"
                    placeholder="First teammate's roll number"
                    value={teammate1RollNo}
                    onChange={(e) => setTeammate1RollNo(e.target.value.toUpperCase())}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Teammate 2 Roll Number</label>
                  <input
                    type="text"
                    placeholder="Second teammate's roll number"
                    value={teammate2RollNo}
                    onChange={(e) => setTeammate2RollNo(e.target.value.toUpperCase())}
                    className="input"
                  />
                </div>
              </div>

              <div style={styles.alert}>
                <strong>⚠️ Important:</strong> Each roll number can only be registered once. 
                No student can be part of multiple teams.
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{width: '100%'}}
              >
                {loading ? 'Registering...' : 'Register Team'}
              </button>
            </form>
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
    </>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
  },
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '2rem',
  },
  iconContainer: {
    display: 'inline-block',
    padding: '1.5rem',
    background: 'var(--glass-bg)',
    borderRadius: '50%',
    marginBottom: '1rem',
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  section: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--glass-border)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: 'var(--text-secondary)',
  },
  alert: {
    padding: '1rem',
    background: 'rgba(254, 225, 64, 0.1)',
    border: '1px solid rgba(254, 225, 64, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },
};

export default TeamRegistration;
