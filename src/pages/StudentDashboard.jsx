import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
import ProblemSelector from '../components/ProblemSelector';
import SubmissionForm from '../components/SubmissionForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, FileText, BookOpen, MessageSquare, Trophy } from 'lucide-react';

const StudentDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (isAdmin) {
      navigate('/admin');
      return;
    }

    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    await Promise.all([
      fetchTeam(),
      fetchSettings(),
    ]);
    setLoading(false);
  };

  const fetchTeam = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('leader_user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching team:', error);
      return;
    }

    if (!data) {
      // No team found, redirect to registration
      navigate('/register-team');
      return;
    }

    setTeam(data);

    // Fetch team members
    const { data: membersData } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', data.id)
      .order('is_leader', { ascending: false });

    setTeamMembers(membersData || []);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('hackathon_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      setSettings(data);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!team) {
    return null; // Will redirect
  }

  const showTimer = settings?.hackathon_start_time && settings?.hackathon_end_time;

  return (
    <>
      <Navbar />
      <div className="page fade-in" style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 className="page-title">Team Dashboard</h1>
            <p className="page-subtitle">Welcome, {team.leader_name}! 🎉</p>
          </div>

          {/* Timer */}
          {showTimer && (
            <div style={styles.timerSection}>
              <CountdownTimer endTime={settings.hackathon_end_time} />
            </div>
          )}

          {/* Team Info Card */}
          <div style={styles.card} className="glass-card">
            <div style={styles.cardHeader}>
              <Users size={24} />
              <h3 style={styles.cardTitle}>Team Information</h3>
            </div>
            <div style={styles.teamGrid}>
              <InfoItem label="Team Name" value={team.team_name} icon={<Trophy size={18} />} />
              {teamMembers.map((member, idx) => (
                <InfoItem 
                  key={idx}
                  label={member.is_leader ? 'Leader' : `Member ${idx}`}
                  value={`${member.member_name || member.roll_number} (${member.roll_number})`}
                />
              ))}
            </div>
          </div>

          {/* Rules */}
          <div style={styles.card} className="glass-card">
            <div style={styles.cardHeader}>
              <BookOpen size={24} />
              <h3 style={styles.cardTitle}>Hackathon Rules</h3>
            </div>
            <div style={styles.content}>
              <ul style={styles.list}>
                <li>⏱️ Duration: 72 Hours</li>
                <li>👥 Team Size: 3 Members</li>
                <li>📝 Submit GitHub repository link</li>
                <li>🎥 Submit Loom presentation video</li>
                <li>✅ Submissions must be made before timer ends</li>
                <li>🏆 Judges will evaluate all submissions</li>
              </ul>
            </div>
          </div>

          {/* Problem Selection */}
          {team && (
            <ProblemSelector 
              teamId={team.id} 
              onAllocationComplete={(data) => setAllocation(data)}
            />
          )}

<br />
          {/* Submission Form */}
          {team && (
            <SubmissionForm 
              teamId={team.id} 
              allocation={allocation}
            />
          )}

          {allocation && allocation.status === 'waitlist' && (
            <div style={styles.waitlistInfo} className="glass-card">
              <FileText size={40} color="var(--text-muted)" />
              <h4 style={styles.waitlistTitle}>You're on the Waitlist</h4>
              <p style={styles.waitlistText}>
                You'll be randomly allocated a problem soon. Submission form will be available once you receive your allocation.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div style={infoStyles.item}>
    {icon && <div style={infoStyles.icon}>{icon}</div>}
    <div>
      <div style={infoStyles.label}>{label}</div>
      <div style={infoStyles.value}>{value}</div>
    </div>
  </div>
);

const styles = {
  page: {
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  timerSection: {
    marginBottom: '2rem',
  },
  card: {
    marginBottom: '2rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--glass-border)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    margin: 0,
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  content: {
    color: 'var(--text-secondary)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  waitlistInfo: {
    textAlign: 'center',
    padding: '2rem',
  },
  waitlistTitle: {
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  waitlistText: {
    color: 'var(--text-secondary)',
  },
};

const infoStyles = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 'var(--radius-md)',
  },
  icon: {
    color: 'var(--accent-purple)',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
};

export default StudentDashboard;
