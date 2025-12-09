import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { validateGitHubURL, validateLoomURL } from '../utils/validation';
import { Github, Video, Send, CheckCircle, FileText } from 'lucide-react';
import Toast from './Toast';

const SubmissionForm = ({ teamId, allocation }) => {
  const [githubUrl, setGithubUrl] = useState('');
  const [loomUrl, setLoomUrl] = useState('');
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [hackathonEnded, setHackathonEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();

    // Subscribe to settings changes
    const settingsSubscription = supabase
      .channel('settings_submission')
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
      fetchExistingSubmission(),
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('hackathon_settings')
      .select('submission_open, hackathon_end_time')
      .eq('id', 1)
      .single();

    if (data) {
      setSubmissionOpen(data.submission_open);
      
      if (data.hackathon_end_time) {
        const ended = new Date(data.hackathon_end_time) < new Date();
        setHackathonEnded(ended);
      }
    }
  };

  const fetchExistingSubmission = async () => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching submission:', error);
      return;
    }

    if (data) {
      setExistingSubmission(data);
      setGithubUrl(data.github_url || '');
      setLoomUrl(data.loom_url || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate URLs
      if (!validateGitHubURL(githubUrl)) {
        throw new Error('Please enter a valid GitHub repository URL');
      }
      
      if (!validateLoomURL(loomUrl)) {
        throw new Error('Please enter a valid Loom video URL');
      }

      // Call RPC function to create/update submission
      const { data, error } = await supabase.rpc('create_submission', {
        p_team_id: teamId,
        p_github: githubUrl,
        p_loom: loomUrl
      });

      if (error) throw error;
      
      setToast({ 
        message: existingSubmission ? 'Submission updated successfully!' : 'Submission saved successfully!', 
        type: 'success' 
      });

      await fetchExistingSubmission();
    } catch (error) {
      setToast({ message: error.message || 'Submission failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading submission form...</div>;
  }

  // Check if student has no allocation yet
  if (!allocation || !allocation.problem_id) {
    return (
      <div style={styles.notReleased} className="glass-card">
        <FileText size={40} color="var(--text-muted)" />
        <h4 style={styles.notReleasedTitle}>Problem Not Allocated Yet</h4>
        <p style={styles.notReleasedText}>
          You need to select and get allocated a problem before you can submit your work.
        </p>
      </div>
    );
  }

  // Check if submission is open
  if (!submissionOpen) {
    return (
      <div style={styles.notReleased} className="glass-card">
        <Video size={40} color="var(--text-muted)" />
        <h4 style={styles.notReleasedTitle}>Submissions Not Open Yet</h4>
        <p style={styles.notReleasedText}>
          Wait for the admin to open submissions. You'll be able to submit your work once it's opened.
        </p>
      </div>
    );
  }

  const isDisabled = hackathonEnded || submitting;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <Send size={24} />
          Submit Your Project
        </h3>
        {existingSubmission && (
          <div style={styles.submittedBadge}>
            <CheckCircle size={16} />
            Submitted
          </div>
        )}
      </div>

      {hackathonEnded && (
        <div style={styles.endedAlert}>
          <strong>Hackathon Ended:</strong> Submissions are now closed.
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="input-group">
          <label className="input-label">
            <Github size={16} style={{verticalAlign: 'middle', marginRight: '0.5rem'}} />
            GitHub Repository URL
          </label>
          <input
            type="url"
            placeholder="https://github.com/username/repository"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            required
            disabled={isDisabled}
            className="input"
          />
          <small style={styles.hint}>
            Enter the public GitHub repository link for your project
          </small>
        </div>

        <div className="input-group">
          <label className="input-label">
            <Video size={16} style={{verticalAlign: 'middle', marginRight: '0.5rem'}} />
            Loom Presentation Video URL
          </label>
          <input
            type="url"
            placeholder="https://www.loom.com/share/..."
            value={loomUrl}
            onChange={(e) => setLoomUrl(e.target.value)}
            required
            disabled={isDisabled}
            className="input"
          />
          <small style={styles.hint}>
            Record and share your project presentation using Loom
          </small>
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={isDisabled}
          style={{width: '100%'}}
        >
          {submitting 
            ? 'Saving...' 
            : existingSubmission 
            ? 'Update Submission' 
            : 'Submit Project'
          }
        </button>

        {existingSubmission && !hackathonEnded && (
          <p style={styles.editableNote}>
            You can edit your submission until the hackathon ends
          </p>
        )}
      </form>

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
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    margin: 0,
  },
  submittedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(79, 172, 254, 0.2)',
    color: 'var(--accent-cyan)',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  hint: {
    display: 'block',
    marginTop: '0.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
  },
  editableNote: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
  endedAlert: {
    padding: '1rem',
    background: 'rgba(255, 8, 68, 0.1)',
    border: '1px solid rgba(255, 8, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#ff0844',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },
  notReleased: {
    textAlign: 'center',
    padding: '2rem',
  },
  notReleasedTitle: {
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  notReleasedText: {
    color: 'var(--text-secondary)',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: 'var(--text-secondary)',
  },
};

export default SubmissionForm;
