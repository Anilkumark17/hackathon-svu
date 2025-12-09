import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, X, CheckCircle, Clock } from 'lucide-react';
import Toast from './Toast';

const ProblemSelector = ({ teamId, onAllocationComplete }) => {
  const [problems, setProblems] = useState([]);
  const [selectedModal, setSelectedModal] = useState(null);
  const [preferences, setPreferences] = useState({ priority1: '', priority2: '', priority3: '' });
  const [currentAllocation, setCurrentAllocation] = useState(null);
  const [projectRequestOpen, setProjectRequestOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Subscribe to settings changes
    const settingsSubscription = supabase
      .channel('hackathon_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'hackathon_settings' },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      settingsSubscription.unsubscribe();
    };
  }, [teamId]);

  const fetchData = async () => {
    await Promise.all([
      fetchSettings(),
      fetchProblems(),
      fetchCurrentAllocation(),
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('hackathon_settings')
      .select('project_request_open')
      .eq('id', 1)
      .single();
    
    if (data) {
      setProjectRequestOpen(data.project_request_open);
    }
  };

  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error) {
      console.error('Error fetching problems:', error);
      return;
    }

    setProblems(data || []);
  };

  const fetchCurrentAllocation = async () => {
    const { data, error } = await supabase
      .from('project_requests')
      .select('*, problem_statements(*)')
      .eq('team_id', teamId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching allocation:', error);
      return;
    }

    setCurrentAllocation(data);
    if (data && onAllocationComplete) {
      onAllocationComplete(data);
    }
  };

  const handleSubmitPreferences = async () => {
    if (!preferences.priority1) {
      setToast({ message: 'Please select at least your 1st priority', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      // Submit 1st priority using existing RPC
      const { data, error } = await supabase.rpc('create_project_request', {
        p_team_id: teamId,
        p_problem_id: preferences.priority1
      });

      if (error) throw error;

      if (data.status === 'allocated') {
        setToast({ 
          message: '🎉 Problem allocated successfully! You got your preference.', 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: 'Added to waitlist. Random allocation will happen later.', 
          type: 'info' 
        });
      }

      await fetchCurrentAllocation();
    } catch (error) {
      setToast({ message: error.message || 'Failed to submit preferences', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnselectProblem = async () => {
    if (!currentAllocation) return;

    try {
      const { error } = await supabase
        .from('project_requests')
        .delete()
        .eq('id', currentAllocation.id);

      if (error) throw error;

      setToast({ message: 'Problem unselected successfully!', type: 'success' });
      setCurrentAllocation(null);
      setPreferences({ priority1: '', priority2: '', priority3: '' });
    } catch (error) {
      setToast({ message: error.message || 'Failed to unselect problem', type: 'error' });
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading problems...</div>;
  }

  if (currentAllocation) {
    return (
      <div style={styles.allocationCard} className="glass-card">
        <div style={styles.allocationHeader}>
          {currentAllocation.status === 'allocated' ? (
            <>
              <CheckCircle size={40} color="var(--accent-cyan)" />
              <h3 style={styles.allocationTitle}>Problem Allocated</h3>
            </>
          ) : (
            <>
              <Clock size={40} color="#fee140" />
              <h3 style={styles.allocationTitle}>Waitlisted</h3>
            </>
          )}
        </div>
        
        <div style={styles.problemInfo}>
          <h4 style={styles.problemTitle}>{currentAllocation.problem_statements.title}</h4>
          <p style={styles.problemDescription}>{currentAllocation.problem_statements.description}</p>
          <div style={styles.badge}>
            {currentAllocation.allocation_method ? currentAllocation.allocation_method.toUpperCase() : 'PENDING'}
          </div>
        </div>

        {projectRequestOpen && (
          <button
            onClick={handleUnselectProblem}
            className="btn"
            style={{...styles.unselectBtn, marginTop: '1.5rem'}}
          >
            Unselect Problem
          </button>
        )}
      </div>
    );
  }

  if (!projectRequestOpen) {
    return (
      <div style={styles.waiting} className="glass-card">
        <FileText size={50} color="var(--text-muted)" />
        <h3 style={styles.waitingTitle}>Problem Selection Not Open Yet</h3>
        <p style={styles.waitingText}>
          Wait for the admin to release project requests. You'll be able to select problems once it's released.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        <FileText size={24} />
        Select Your Problem Preferences
      </h3>
      <p style={styles.subtitle}>
        Choose your problem preferences in order of priority. You'll be allocated based on availability.
      </p>

      <div style={styles.grid}>
        {problems.map((problem) => {
          const isPriority1 = preferences.priority1 === problem.id;
          const isPriority2 = preferences.priority2 === problem.id;
          const isPriority3 = preferences.priority3 === problem.id;
          const isSelected = isPriority1 || isPriority2 || isPriority3;
          const priorityLabel = isPriority1 ? '1st' : isPriority2 ? '2nd' : isPriority3 ? '3rd' : '';

          return (
            <div 
              key={problem.id} 
              style={{
                ...styles.problemCard,
                ...(isSelected ? styles.problemCardSelected : {})
              }} 
              className="glass-card"
            >
              {isSelected && (
                <div style={styles.priorityBadge}>
                  {priorityLabel} Priority
                </div>
              )}
              
              <div style={styles.problemHeader}>
                <h4 style={styles.problemCardTitle}>{problem.title}</h4>
                <div style={styles.codeBadge}>{problem.code}</div>
              </div>

              <p style={styles.problemCardDescription}>
                {problem.description.length > 100 
                  ? problem.description.substring(0, 100) + '...' 
                  : problem.description}
              </p>

              <div style={styles.cardActions}>
                <button
                  onClick={() => setSelectedModal(problem)}
                  className="btn btn-primary"
                  style={{ color: 'white' }}
                >
                  View Full Details
                </button>

                {!isSelected && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setPreferences(prev => ({
                          ...prev,
                          [e.target.value]: problem.id
                        }));
                      }
                    }}
                    style={styles.prioritySelect}
                    className="input"
                  >
                    <option value="">Select Priority...</option>
                    {!preferences.priority1 && <option value="priority1">🥇 1st Priority</option>}
                    {!preferences.priority2 && <option value="priority2">🥈 2nd Priority</option>}
                    {!preferences.priority3 && <option value="priority3">🥉 3rd Priority</option>}
                  </select>
 )}
              </div>
            </div>
          );
        })}
      </div>

      {(preferences.priority1 || preferences.priority2 || preferences.priority3) && (
        <div style={styles.submitSection}>
          <div style={styles.selectedPreferences}>
            <h4>Your Selections:</h4>
            {preferences.priority1 && (
              <div style={styles.prefItem}>
                1st: {problems.find(p => p.id === preferences.priority1)?.title}
                <button onClick={() => setPreferences(prev => ({ ...prev, priority1: '' }))} style={styles.removeBtn}>×</button>
              </div>
            )}
            {preferences.priority2 && (
              <div style={styles.prefItem}>
                2nd: {problems.find(p => p.id === preferences.priority2)?.title}
                <button onClick={() => setPreferences(prev => ({ ...prev, priority2: '' }))} style={styles.removeBtn}>×</button>
              </div>
            )}
            {preferences.priority3 && (
              <div style={styles.prefItem}>
                3rd: {problems.find(p => p.id === preferences.priority3)?.title}
                <button onClick={() => setPreferences(prev => ({ ...prev, priority3: '' }))} style={styles.removeBtn}>×</button>
              </div>
            )}
          </div>
          <button
            onClick={handleSubmitPreferences}
            disabled={submitting}
            className="btn btn-success"
            style={{width: '100%', marginTop: '1rem'}}
          >
            {submitting ? 'Submitting...' : 'Submit Preferences'}
          </button>
        </div>
      )}

      {/* Fullscreen Modal */}
      {selectedModal && (
        <div style={styles.modalOverlay} onClick={() => setSelectedModal(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-card">
            <button onClick={() => setSelectedModal(null)} style={styles.closeBtn}>
              <X size={24} />
            </button>
            
            <div style={styles.modalHeader}>
              <div style={styles.modalCodeBadge}>{selectedModal.code}</div>
              <h2 style={styles.modalTitle}>{selectedModal.title}</h2>
            </div>

            <div style={styles.modalBody}>
              <h4 style={styles.modalSectionTitle}>Problem Description</h4>
              <p style={styles.modalDescription}>{selectedModal.description}</p>
              
              <div style={styles.modalFooter}>
                <div>
                  <strong>Capacity:</strong> {selectedModal.capacity} teams
                </div>
                <div>
                  <strong>Code:</strong> {selectedModal.code}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

const styles = {
  container: {
    marginBottom: '2rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  problemCard: {
    padding: '1.5rem',
    position: 'relative',
    transition: 'all var(--transition-normal)',
  },
  problemCardSelected: {
    borderColor: 'var(--accent-cyan)',
    borderWidth: '2px',
  },
  priorityBadge: {
    position: 'absolute',
    top: '-0.5rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    background: 'var(--success-gradient)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
    zIndex: 1,
  },
  problemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  problemCardTitle: {
    fontSize: '1.25rem',
    margin: 0,
    flex: 1,
  },
  problemCardDescription: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    minHeight: '60px',
  },
  codeBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'var(--primary-gradient)',
    color: 'white',
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  viewBtn: {
    background: 'transparent',
    border: '1px solid var(--glass-border)',
  },
  prioritySelect: {
    width: '100%',
  },
  submitSection: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
  },
  selectedPreferences: {
    marginBottom: '1rem',
  },
  prefItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--radius-md)',
    marginTop: '0.5rem',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-pink)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0 0.5rem',
  },
  allocationCard: {
    textAlign: 'center',
    padding: '2rem',
  },
  allocationHeader: {
    marginBottom: '1.5rem',
  },
  allocationTitle: {
    fontSize: '1.5rem',
    marginTop: '1rem',
  },
  problemInfo: {
    textAlign: 'left',
  },
  problemTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  problemDescription: {
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'var(--primary-gradient)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  unselectBtn: {
    background: 'rgba(255, 8, 68, 0.2)',
    border: '1px solid rgba(255, 8, 68, 0.4)',
    color: '#ff0844',
  },
  waiting: {
    textAlign: 'center',
    padding: '3rem 2rem',
  },
  waitingTitle: {
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  waitingText: {
    color: 'var(--text-secondary)',
    maxWidth: '500px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: 'var(--text-secondary)',
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
  },
  modalContent: {
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    padding: '3rem',
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'all var(--transition-fast)',
  },
  modalHeader: {
    marginBottom: '2rem',
    borderBottom: '2px solid var(--glass-border)',
    paddingBottom: '1rem',
  },
  modalCodeBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: 'var(--primary-gradient)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  modalTitle: {
   fontSize: '2rem',
    margin: 0,
  },
  modalBody: {
    lineHeight: '1.8',
  },
  modalSectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: 'var(--accent-purple)',
  },
  modalDescription: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
    marginBottom: '2rem',
  },
  modalFooter: {
    display: 'flex',
    gap: '2rem',
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 'var(--radius-md)',
  },
};

export default ProblemSelector;
