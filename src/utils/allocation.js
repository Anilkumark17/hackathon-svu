// Allocation utilities using RPC functions

// Get FCFS allocation count for a problem
export const getFCFSCount = async (supabase, problemId) => {
  const { data, error } = await supabase
    .from('project_requests')
    .select('id')
    .eq('problem_id', problemId)
    .eq('status', 'allocated');

  if (error) {
    console.error('Error getting FCFS count:', error);
    return 0;
  }

  return data.length;
};

// Create project request using RPC function
export const allocateProblem = async (supabase, teamId, problemId) => {
  const { data, error } = await supabase
    .rpc('create_project_request', {
      p_team_id: teamId,
      p_problem_id: problemId
    });

  if (error) {
    throw new Error(error.message || 'Failed to allocate problem');
  }

  return {
    allocation: data,
    isFCFS: data.status === 'allocated' && data.allocation_method === 'fcfs'
  };
};

// Random allocation for waitlisted teams using RPC
export const randomAllocateWaitlistedTeams = async (supabase) => {
  try {
    const { error } = await supabase.rpc('random_allocate_remaining');

    if (error) throw error;

    return {
      success: true,
      message: 'Successfully allocated waitlisted teams randomly'
    };
  } catch (error) {
    console.error('Error in random allocation:', error);
    return {
      success: false,
      message: error.message || 'Failed to allocate waitlisted teams'
    };
  }
};
