-- Multi-Priority Allocation System - Database Migration
-- RUN THIS IN SUPABASE SQL EDITOR

-- ============================================
-- STEP 1: Add priority columns to project_requests table
-- ============================================

-- Add columns for storing 3 priority choices
ALTER TABLE project_requests 
ADD COLUMN IF NOT EXISTS priority_1 UUID REFERENCES problem_statements(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority_2 UUID REFERENCES problem_statements(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority_3 UUID REFERENCES problem_statements(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS allocated_priority INTEGER, -- Which priority was allocated (1, 2, 3, or NULL)
ADD COLUMN IF NOT EXISTS allocation_status TEXT DEFAULT 'pending'; -- 'allocated', 'waitlist', 'not_allocated'

-- ============================================
-- STEP 2: Drop and recreate create_project_request function
-- ============================================

DROP FUNCTION IF EXISTS create_project_request(UUID, UUID);

CREATE OR REPLACE FUNCTION create_project_request(
  p_team_id UUID,
  p_priority_1 UUID,
  p_priority_2 UUID DEFAULT NULL,
  p_priority_3 UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_request project_requests;
  v_problem_1_capacity INT;
  v_problem_1_count INT;
  v_problem_2_capacity INT;
  v_problem_2_count INT;
  v_problem_3_capacity INT;
  v_problem_3_count INT;
  v_allocated_problem UUID;
  v_allocated_priority INT;
  v_status TEXT;
  v_method TEXT := 'fcfs';
BEGIN
  -- Check if team already has a request
  SELECT * INTO v_existing_request
  FROM project_requests
  WHERE team_id = p_team_id;

  IF FOUND THEN
    RAISE EXCEPTION 'Team has already submitted a project request';
  END IF;

  -- ============================================
  -- TRY PRIORITY 1
  -- ============================================
  IF p_priority_1 IS NOT NULL THEN
    -- Get capacity and current count for Priority 1
    SELECT capacity INTO v_problem_1_capacity
    FROM problem_statements
    WHERE id = p_priority_1;

    SELECT COUNT(*) INTO v_problem_1_count
    FROM project_requests
    WHERE problem_id = p_priority_1 AND status = 'allocated';

    -- Check if Priority 1 has available slots
    IF v_problem_1_count < v_problem_1_capacity THEN
      v_allocated_problem := p_priority_1;
      v_allocated_priority := 1;
      v_status := 'allocated';
      GOTO insert_request;
    END IF;
  END IF;

  -- ============================================
  -- TRY PRIORITY 2 (if Priority 1 was full)
  -- ============================================
  IF p_priority_2 IS NOT NULL THEN
    -- Get capacity and current count for Priority 2
    SELECT capacity INTO v_problem_2_capacity
    FROM problem_statements
    WHERE id = p_priority_2;

    SELECT COUNT(*) INTO v_problem_2_count
    FROM project_requests
    WHERE problem_id = p_priority_2 AND status = 'allocated';

    -- Check if Priority 2 has available slots
    IF v_problem_2_count < v_problem_2_capacity THEN
      v_allocated_problem := p_priority_2;
      v_allocated_priority := 2;
      v_status := 'allocated';
      GOTO insert_request;
    END IF;
  END IF;

  -- ============================================
  -- TRY PRIORITY 3 (if Priority 1 and 2 were full)
  -- ============================================
  IF p_priority_3 IS NOT NULL THEN
    -- Get capacity and current count for Priority 3
    SELECT capacity INTO v_problem_3_capacity
    FROM problem_statements
    WHERE id = p_priority_3;

    SELECT COUNT(*) INTO v_problem_3_count
    FROM project_requests
    WHERE problem_id = p_priority_3 AND status = 'allocated';

    -- Check if Priority 3 has available slots
    IF v_problem_3_count < v_problem_3_capacity THEN
      v_allocated_problem := p_priority_3;
      v_allocated_priority := 3;
      v_status := 'allocated';
      GOTO insert_request;
    END IF;
  END IF;

  -- ============================================
  -- ALL PRIORITIES FULL - NOT ALLOCATED
  -- ============================================
  v_allocated_problem := NULL;
  v_allocated_priority := NULL;
  v_status := 'not_allocated';

  <<insert_request>>
  -- Insert the project request with all priority info
  INSERT INTO project_requests (
    team_id,
    problem_id,
    priority_1,
    priority_2,
    priority_3,
    allocated_priority,
    allocation_status,
    status,
    allocation_method,
    requested_at
  ) VALUES (
    p_team_id,
    v_allocated_problem,
    p_priority_1,
    p_priority_2,
    p_priority_3,
    v_allocated_priority,
    v_status,
    v_status,
    v_method,
    NOW()
  );

  -- Return result
  RETURN json_build_object(
    'status', v_status,
    'allocated_problem', v_allocated_problem,
    'allocated_priority', v_allocated_priority,
    'message', 
      CASE 
        WHEN v_status = 'allocated' THEN 
          'Allocated ' || v_allocated_priority || CASE v_allocated_priority
            WHEN 1 THEN 'st'
            WHEN 2 THEN 'nd'
            WHEN 3 THEN 'rd'
          END || ' priority problem'
        WHEN v_status = 'not_allocated' THEN 
          'Not Allocated - All priorities full. Contact Admin.'
      END
  );
END;
$$;

-- ============================================
-- STEP 3: Update RLS policies if needed
-- (No changes needed - existing policies should work)
-- ============================================

-- Migration complete!
-- Next: Update frontend to send all 3 priorities
