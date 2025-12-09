import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { randomAllocateWaitlistedTeams } from '../utils/allocation';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { 
  Users, Trophy, FileCheck, PlayCircle, Send, Shuffle, 
  BarChart3, CheckCircle, Clock, PlusCircle, RotateCcw, Pencil, Trash2, StopCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [settings, setSettings] = useState(null);
  const [teams, setTeams] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Add Problem Form States
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [newProblemCode, setNewProblemCode] = useState('');
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemDescription, setNewProblemDescription] = useState('');
  const [newProblemCapacity, setNewProblemCapacity] = useState(4);
  const [addingProblem, setAddingProblem] = useState(false);
  const [expandedProblems, setExpandedProblems] = useState({});

  // Edit Problem States
  const [editingProblem, setEditingProblem] = useState(null);
  const [editProblemCode, setEditProblemCode] = useState('');
  const [editProblemTitle, setEditProblemTitle] = useState('');
  const [editProblemDescription, setEditProblemDescription] = useState('');
  const [editProblemCapacity, setEditProblemCapacity] = useState(4);
  const [updatingProblem, setUpdatingProblem] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Recalculate stats whenever data changes
  useEffect(() => {
    calculateStats();
  }, [teams, problems, allocations, submissions]);

  const fetchData = async () => {
    await Promise.all([
      fetchSettings(),
      fetchTeams(),
      fetchAllocations(),
      fetchSubmissions(),
      fetchProblems(),
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('hackathon_settings')
      .select('*')
      .eq('id', 1)
      .single();

    setSettings(data);
  };

  const fetchTeams = async () => {
    const { data } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    setTeams(data || []);
  };

  const fetchAllocations = async () => {
    const { data } = await supabase
      .from('project_requests')
      .select('*, teams(team_name), problem_statements(title)')
      .order('requested_at', { ascending: false });

    setAllocations(data || []);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*, teams(team_name)')
      .order('submitted_at', { ascending: false });

    setSubmissions(data || []);
  };

  const fetchProblems = async () => {
    const { data} = await supabase
      .from('problem_statements')
      .select('*')
      .order('title');

    setProblems(data || []);
  };

  const calculateStats = () => {
    const waitlisted = allocations.filter(a => a.status === 'waitlist').length;
    const allocated = allocations.filter(a => a.status === 'allocated').length;
    
    setStats({
      totalTeams: teams.length,
      totalProblems: problems.length,
      totalSubmissions: submissions.length,
      waitlistedTeams: waitlisted,
      allocatedTeams: allocated,
    });
  };

  const handleToggleProjectRequest = async () => {
    try {
      const newState = !settings?.project_request_open;
      const { error } = await supabase.rpc('toggle_project_request', {
        p_open: newState
      });

      if (error) throw error;

      setToast({ 
        message: newState 
          ? 'Project requests opened! Teams can now select problems.' 
          : 'Project requests closed!', 
        type: 'success' 
      });
      await fetchSettings();
    } catch (error) {
      setToast({ message: error.message || 'Failed to toggle project requests', type: 'error' });
    }
  };

  const handleStartHackathon = async () => {
    try {
      const { error } = await supabase.rpc('start_hackathon', {
        p_duration_hours: 72
      });

      if (error) throw error;

      setToast({ message: '🎉 Hackathon started! 72-hour timer is now running.', type: 'success' });
      await fetchSettings();
    } catch (error) {
      setToast({ message: error.message || 'Failed to start hackathon', type: 'error' });
    }
  };

  const handleRestartTimer = async () => {
    try {
      const { error } = await supabase
        .from('hackathon_settings')
        .update({
          hackathon_start_time: new Date().toISOString(),
          hackathon_end_time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', 1);

      if (error) throw error;

      setToast({ message: '🔄 Timer restarted! New 72-hour countdown started.', type: 'success' });
      await fetchSettings();
    } catch (error) {
      setToast({ message: error.message || 'Failed to restart timer', type: 'error' });
    }
  };

  const handleToggleSubmission = async () => {
    try {
      const newState = !settings?.submission_open;
      const { error } = await supabase.rpc('toggle_submission', {
        p_open: newState
      });

      if (error) throw error;

      setToast({ 
        message: newState 
          ? 'Submissions opened! Teams can now submit their projects.' 
          : 'Submissions closed!', 
        type: 'success' 
      });
      await fetchSettings();
    } catch (error) {
      setToast({ message: error.message || 'Failed to toggle submissions', type: 'error' });
    }
  };

  const handleRandomAllocation = async () => {
    try {
      const result = await randomAllocateWaitlistedTeams(supabase);
      
      if (result.success) {
        setToast({ message: result.message, type: 'success' });
        await fetchAllocations();
        calculateStats();
      } else {
        setToast({ message: result.message, type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to allocate waitlisted teams', type: 'error' });
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    setAddingProblem(true);

    try {
      const { data, error } = await supabase
        .from('problem_statements')
        .insert({
          code: newProblemCode.toUpperCase(),
          title: newProblemTitle,
          description: newProblemDescription,
          capacity: newProblemCapacity,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setToast({ message: 'Problem statement added successfully!', type: 'success' });
      
      // Reset form
      setNewProblemCode('');
      setNewProblemTitle('');
      setNewProblemDescription('');
      setNewProblemCapacity(4);
      setShowAddProblem(false);
      
      // Refresh problems list
      await fetchProblems();
      calculateStats();
    } catch (error) {
      let message = error.message || 'Failed to add problem';
      if (message.includes('duplicate') || message.includes('unique')) {
        message = 'Problem code already exists';
      }
      setToast({ message, type: 'error' });
    } finally {
      setAddingProblem(false);
    }
  };

  const toggleProblemExpand = (problemId) => {
    setExpandedProblems(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setEditProblemCode(problem.code);
    setEditProblemTitle(problem.title);
    setEditProblemDescription(problem.description);
    setEditProblemCapacity(problem.capacity);
  };

  const handleUpdateProblem = async (e) => {
    e.preventDefault();
    setUpdatingProblem(true);

    try {
      const { error } = await supabase
        .from('problem_statements')
        .update({
          title: editProblemTitle,
          description: editProblemDescription,
          capacity: editProblemCapacity
        })
        .eq('id', editingProblem.id);

      if (error) throw error;

      setToast({ message: 'Problem statement updated successfully!', type: 'success' });
      setEditingProblem(null);
      
      await fetchProblems();
      calculateStats();
    } catch (error) {
      setToast({ message: error.message || 'Failed to update problem', type: 'error' });
    } finally {
      setUpdatingProblem(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('problem_statements')
        .delete()
        .eq('id', problemId);

      if (error) throw error;

      setToast({ message: 'Problem statement deleted successfully!', type: 'success' });
      
      await fetchProblems();
      calculateStats();
    } catch (error) {
      setToast({ message: error.message || 'Failed to delete problem. It may be in use.', type: 'error' });
    }
  };

  const handleStopTimer = async () => {
    if (!confirm('Stop the hackathon timer? This will reset the hackathon to not-started state.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('hackathon_settings')
        .update({
          hackathon_start_time: null,  // Clear start time
          hackathon_end_time: null     // Clear end time
        })
        .eq('id', 1);

      if (error) throw error;

      setToast({ message: '⏹️ Hackathon stopped! Timer reset to not-started state.', type: 'success' });
      await fetchSettings();
    } catch (error) {
      setToast({ message: error.message || 'Failed to stop timer', type: 'error' });
    }
  };


  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <>
      <Navbar />
      <div className="page fade-in" style={styles.page}>
        <div style={styles.container}>
          <div className="page-header">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage the hackathon event</p>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <StatCard icon={<Users />} label="Total Teams" value={stats.totalTeams} color="var(--accent-purple)" />
            <StatCard icon={<Trophy />} label="Problems" value={stats.totalProblems} color="var(--accent-pink)" />
            <StatCard icon={<CheckCircle />} label="Allocated" value={stats.allocatedTeams} color="var(--accent-cyan)" />
            <StatCard icon={<Clock />} label="Waitlisted" value={stats.waitlistedTeams} color="#fee140" />
            <StatCard icon={<FileCheck />} label="Submissions" value={stats.totalSubmissions} color="var(--accent-blue)" />
          </div>

          {/* Control Panel */}
          <div style={styles.card} className="glass-card">
            <h3 style={styles.cardTitle}>
              <BarChart3 size={24} />
              Control Panel
            </h3>
            
            <div style={styles.controlsGrid}>
              <ControlButton
                icon={<PlayCircle />}
                label={settings?.project_request_open ? "Close Project Requests" : "Open Project Requests"}
                description={settings?.project_request_open ? "Prevent teams from selecting" : "Allow teams to select problems"}
                active={settings?.project_request_open}
                onClick={handleToggleProjectRequest}
                disabled={false}
              />

              <ControlButton
                icon={<PlayCircle />}
                label="Start Hackathon"
                description="Begin 72-hour countdown timer"
                active={!!settings?.hackathon_start_time}
                onClick={handleStartHackathon}
                disabled={!!settings?.hackathon_start_time}
              />

              <ControlButton
                icon={<RotateCcw />}
                label="Restart Timer"
                description="Reset 72-hour countdown"
                active={false}
                onClick={handleRestartTimer}
                disabled={!settings?.hackathon_start_time}
              />

              <ControlButton
                icon={<StopCircle />}
                label="Stop Timer"
                description="End hackathon immediately"
                active={false}
                onClick={handleStopTimer}
                disabled={!settings?.hackathon_start_time}
              />

              <ControlButton
                icon={<Send />}
                label={settings?.submission_open ? "Close Submissions" : "Open Submissions"}
                description={settings?.submission_open ? "Prevent teams from submitting" : "Open submission form for teams"}
                active={settings?.submission_open}
                onClick={handleToggleSubmission}
                disabled={false}
              />

              <ControlButton
                icon={<Shuffle />}
                label="Random Allocation"
                description={`Allocate ${stats.waitlistedTeams} waitlisted teams`}
                active={false}
                onClick={handleRandomAllocation}
                disabled={stats.waitlistedTeams === 0}
              />
            </div>
          </div>

          {/* Add New Problem Section */}
          <div style={styles.card} className="glass-card">
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <Trophy size={24} />
                Manage Problem Statements
              </h3>
              <button
                onClick={() => setShowAddProblem(!showAddProblem)}
                className="btn btn-primary"
                style={{marginLeft: 'auto'}}
              >
                <PlusCircle size={18} style={{marginRight: '0.5rem'}} />
                {showAddProblem ? 'Cancel' : 'Add New Problem'}
              </button>
            </div>

            {showAddProblem && (
              <form onSubmit={handleAddProblem} style={styles.addProblemForm}>
                <div style={styles.formGrid}>
                  <div className="input-group">
                    <label className="input-label">Problem Code *</label>
                    <input
                      type="text"
                      placeholder="e.g., P001, ECOM, etc."
                      value={newProblemCode}
                      onChange={(e) => setNewProblemCode(e.target.value)}
                      required
                      className="input"
                    />
                    <small style={styles.hint}>Unique identifier for this problem</small>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newProblemCapacity}
                      onChange={(e) => setNewProblemCapacity(parseInt(e.target.value))}
                      required
                      className="input"
                    />
                    <small style={styles.hint}>Max teams (FCFS limit)</small>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Problem Title *</label>
                  <input
                    type="text"
                    placeholder="E-Commerce Platform"
                    value={newProblemTitle}
                    onChange={(e) => setNewProblemTitle(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Description *</label>
                  <textarea
                    placeholder="Build a full-stack e-commerce platform with cart, payments, and admin panel..."
                    value={newProblemDescription}
                    onChange={(e) => setNewProblemDescription(e.target.value)}
                    required
                    className="input"
                    rows={4}
                    style={styles.textarea}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={addingProblem}
                  style={{width: '100%'}}
                >
                  {addingProblem ? 'Adding...' : 'Add Problem Statement'}
                </button>
              </form>
            )}

            {/* Problems List */}
            <div style={styles.problemsList}>
              <h4 style={styles.problemsListTitle}>Existing Problems ({problems.length})</h4>
              {problems.length === 0 ? (
                <p style={styles.emptyState}>No problems added yet</p>
              ) : (
                <div style={styles.problemsGrid}>
                  {problems.map((problem) => {
                    const isExpanded = expandedProblems[problem.id];
                    const shouldTruncate = problem.description.length > 150;
                    const displayDescription = isExpanded || !shouldTruncate 
                      ? problem.description 
                      : problem.description.substring(0, 150) + '...';

                    return (
                      <div key={problem.id} style={styles.problemCard} className="glass-card">
                        <div style={styles.problemCodeBadge}>{problem.code}</div>
                        <div style={styles.problemActions}>
                          <button
                            onClick={() => handleEditProblem(problem)}
                            style={styles.iconBtn}
                            title="Edit Problem"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProblem(problem.id)}
                            style={styles.iconBtnDelete}
                            title="Delete Problem"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h5 style={styles.problemCardTitle}>{problem.title}</h5>
                        <p style={styles.problemCardDesc}>
                          {displayDescription}
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleProblemExpand(problem.id)}
                              style={styles.showMoreBtn}
                            >
                              {isExpanded ? 'Show Less' : 'Show More'}
                            </button>
                          )}
                        </p>
                        <div style={styles.problemCardFooter}>
                          <span style={styles.capacityInfo}>
                            Capacity: {problem.capacity} teams
                          </span>
                          <span style={problem.is_active ? styles.statusActive : styles.statusInactive}>
                            {problem.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Edit Problem Modal */}
          {editingProblem && (
            <div style={styles.modalOverlay} onClick={() => setEditingProblem(null)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-card">
                <button onClick={() => setEditingProblem(null)} style={styles.closeBtn}>×</button>
                
                <h3 style={styles.modalTitle}>Edit Problem Statement</h3>
                
                <form onSubmit={handleUpdateProblem} style={styles.editForm}>
                  <div className="input-group">
                    <label className="input-label">Problem Code (Read-only)</label>
                    <input
                      type="text"
                      value={editProblemCode}
                      disabled
                      className="input"
                      style={{opacity: 0.6}}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Problem Title *</label>
                    <input
                      type="text"
                      value={editProblemTitle}
                      onChange={(e) => setEditProblemTitle(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description *</label>
                    <textarea
                      value={editProblemDescription}
                      onChange={(e) => setEditProblemDescription(e.target.value)}
                      required
                      className="input"
                      rows={6}
                      style={{resize: 'vertical', fontFamily: 'inherit'}}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Capacity *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editProblemCapacity}
                      onChange={(e) => setEditProblemCapacity(parseInt(e.target.value))}
                      required
                      className="input"
                    />
                  </div>

                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button
                      type="button"
                      onClick={() => setEditingProblem(null)}
                      className="btn"
                      style={{flex: 1}}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingProblem}
                      className="btn btn-success"
                      style={{flex: 1}}
                    >
                      {updatingProblem ? 'Updating...' : 'Update Problem'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Team Allocations Table */}
          <div style={styles.card} className="glass-card">
            <h3 style={styles.cardTitle}>
              <Users size={24} />
              Team Allocations
            </h3>
            
            {allocations.length === 0 ? (
              <p style={styles.emptyState}>No allocations yet</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Team Name</th>
                      <th style={styles.th}>Problem</th>
                      <th style={styles.th}>Method</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((allocation) => (
                      <tr key={allocation.id} style={styles.tr}>
                        <td style={styles.td}>{allocation.teams.team_name}</td>
                        <td style={styles.td}>{allocation.problem_statements.title}</td>
                        <td style={styles.td}>
                          <span style={getAllocationMethodBadgeStyle(allocation.allocation_method)}>
                            {allocation.allocation_method?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadgeStyle(allocation.status)}>
                            {allocation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Submissions Table */}
          <div style={styles.card} className="glass-card">
            <h3 style={styles.cardTitle}>
              <FileCheck size={24} />
              Submissions
            </h3>
            
            {submissions.length === 0 ? (
              <p style={styles.emptyState}>No submissions yet</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Team Name</th>
                      <th style={styles.th}>GitHub</th>
                      <th style={styles.th}>Loom</th>
                      <th style={styles.th}>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id} style={styles.tr}>
                        <td style={styles.td}>{submission.teams.team_name}</td>
                        <td style={styles.td}>
                          <a 
                            href={submission.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.link}
                          >
                            View Repo
                          </a>
                        </td>
                        <td style={styles.td}>
                          <a 
                            href={submission.loom_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={styles.link}
                          >
                            Watch Video
                          </a>
                        </td>
                        <td style={styles.td}>
                          {new Date(submission.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

const StatCard = ({ icon, label, value, color }) => (
  <div style={styles.statCard} className="glass-card">
    <div style={{...styles.statIcon, color}}>{icon}</div>
    <div style={styles.statValue}>{value || 0}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const ControlButton = ({ icon, label, description, active, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...styles.controlButton,
      ...(active ? styles.controlButtonActive : {}),
      ...(disabled ? styles.controlButtonDisabled : {}),
    }}
    className="glass-card"
  >
    <div style={styles.controlIcon}>{icon}</div>
    <div style={styles.controlLabel}>{label}</div>
    <div style={styles.controlDescription}>{description}</div>
    {active && <div style={styles.activeBadge}>Active</div>}
  </button>
);

const getAllocationMethodBadgeStyle = (method) => ({
  ...styles.badge,
  ...(method === 'fcfs' ? styles.badgeFcfs : 
      method === 'random' ? styles.badgeRandom : 
      styles.badgeWaitlist),
});

const getStatusBadgeStyle = (status) => ({
  ...styles.badge,
  ...(status === 'allocated' ? styles.badgeAllocated : styles.badgeWaitlisted),
});

const styles = {
  page: {
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    textAlign: 'center',
    padding: '1.5rem',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  card: {
    marginBottom: '2rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  controlButton: {
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    color: 'var(--text-primary)',
    transition: 'all var(--transition-normal)',
    position: 'relative',
  },
  controlButtonActive: {
    borderColor: 'var(--accent-cyan)',
  },
  controlButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  controlIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    color: 'var(--accent-purple)',
  },
  controlLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  controlDescription: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  activeBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    background: 'var(--success-gradient)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: '1px solid var(--glass-border)',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid var(--glass-border)',
  },
  td: {
    padding: '1rem',
    color: 'var(--text-primary)',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeFcfs: {
    background: 'rgba(79, 172, 254, 0.2)',
    color: 'var(--accent-cyan)',
  },
  badgeRandom: {
    background: 'rgba(240, 147, 251, 0.2)',
    color: 'var(--accent-pink)',
  },
  badgeWaitlist: {
    background: 'rgba(254, 225, 64, 0.2)',
    color: '#fee140',
  },
  badgeAllocated: {
    background: 'rgba(79, 172, 254, 0.2)',
    color: 'var(--accent-cyan)',
  },
  badgeWaitlisted: {
    background: 'rgba(254, 225, 64, 0.2)',
    color: '#fee140',
  },
  link: {
    color: 'var(--accent-purple)',
    textDecoration: 'underline',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--text-muted)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  addProblemForm: {
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '2rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  hint: {
    display: 'block',
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  problemsList: {
    marginTop: '2rem',
  },
  problemsListTitle: {
    fontSize: '1.125rem',
    marginBottom: '1rem',
    color: 'var(--text-secondary)',
  },
  problemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  problemCard: {
    padding: '1.5rem',
    position: 'relative',
  },
  problemCodeBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    background: 'var(--primary-gradient)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  problemCardTitle: {
    fontSize: '1.125rem',
    marginBottom: '0.5rem',
    marginTop: 0,
  },
  problemCardDesc: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '1rem',
  },
  problemCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid var(--glass-border)',
  },
  capacityInfo: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  statusActive: {
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'var(--success-gradient)',
  },
  statusInactive: {
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--text-muted)',
  },
  showMoreBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-purple)',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 0.5rem',
    fontSize: '0.875rem',
    textDecoration: 'underline',
    marginLeft: '0.5rem',
  },
  problemCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  problemActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  iconBtn: {
    background: 'rgba(142, 84, 233, 0.2)',
    border: '1px solid rgba(142, 84, 233, 0.4)',
    color: 'var(--accent-purple)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  iconBtnDelete: {
    background: 'rgba(255, 8, 68, 0.2)',
    border: '1px solid rgba(255, 8, 68, 0.4)',
    color: '#ff0844',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
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
  },
  modalContent: {
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    padding: '2rem',
  },
  modalTitle: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-primary)',
  },
};

export default AdminDashboard;
