# Admin Dashboard - Edit & Delete Features

## ✅ What's Been Added:

### 1. Icons Import (Line 7-10)
```javascript
import { 
  Users, Trophy, FileCheck, PlayCircle, Send, Shuffle, 
  BarChart3, CheckCircle, Clock, PlusCircle, RotateCcw, Pencil, Trash2  // ← Added Pencil, Trash2
} from 'lucide-react';
```

### 2. Edit Modal States (After line 29)
```javascript
  // Edit Problem States
  const [editingProblem, setEditingProblem] = useState(null);
  const [editProblemCode, setEditProblemCode] = useState('');
  const [editProblemTitle, setEditProblemTitle] = useState('');
  const [editProblemDescription, setEditProblemDescription] = useState('');
  const [editProblemCapacity, setEditProblemCapacity] = useState(4);
  const [updatingProblem, setUpdatingProblem] = useState(false);
```

### 3. Handler Functions (After toggleProblemExpand ~line 253)
```javascript
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
```

### 4. Problem Card with Edit/Delete Buttons (Replace problem card mapping)
```javascript
{problems.map((problem) => {
  const isExpanded = expandedProblems[problem.id];
  const shouldTruncate = problem.description.length > 150;
  const displayDescription = isExpanded || !shouldTruncate 
    ? problem.description 
    : problem.description.substring(0, 150) + '...';

  return (
    <div key={problem.id} style={styles.problemCard} className="glass-card">
      <div style={styles.problemCodeBadge}>{problem.code}</div>
      
      {/* Edit/Delete Buttons */}
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
```

### 5. Edit Modal (Add after problem cards list)
```javascript
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
```

### 6. New Styles (Add to styles object)
```javascript
  problemActions: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    display: 'flex',
    gap: '0.5rem',
    zIndex: 2,
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
```

## 🔧 Current Issue:
Line 253 in AdminDashboard.jsx is completely corrupted with escape characters.

## 💡 **SOLUTION:**
I'll create a COMPLETE clean AdminDashboard.jsx file with ALL features including edit/delete.

Would you like me to:
1. **Overwrite** the corrupted file with a clean complete version? (RECOMMENDED)
2. **Manually fix** line 253 first, then add edit/delete features?
