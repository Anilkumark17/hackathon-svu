// Handler functions for edit and delete - ADD THESE TO AdminDashboard.jsx after toggleProblemExpand

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
      
      // Refresh problems list
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
      
      // Refresh problems list
      await fetchProblems();
      calculateStats();
    } catch (error) {
      setToast({ message: error.message || 'Failed to delete problem. It may be in use.', type: 'error' });
    }
  };
