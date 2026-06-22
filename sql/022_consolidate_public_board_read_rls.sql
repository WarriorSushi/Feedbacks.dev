-- Consolidate public board SELECT RLS policies.
-- Keeps public visibility and owner access semantics while removing duplicate permissive SELECT policies.

DROP POLICY IF EXISTS "Anyone can read accessible boards" ON public.public_board_settings;
DROP POLICY IF EXISTS "Project owners can manage board settings" ON public.public_board_settings;
DROP POLICY IF EXISTS "public_board_settings_read_accessible_or_owned" ON public.public_board_settings;
DROP POLICY IF EXISTS "public_board_settings_insert_owned" ON public.public_board_settings;
DROP POLICY IF EXISTS "public_board_settings_update_owned" ON public.public_board_settings;
DROP POLICY IF EXISTS "public_board_settings_delete_owned" ON public.public_board_settings;

CREATE POLICY "public_board_settings_read_accessible_or_owned"
  ON public.public_board_settings
  FOR SELECT
  USING (
    ((enabled = true) AND (visibility <> 'private'::text))
    OR project_id IN (
      SELECT projects.id
      FROM public.projects
      WHERE projects.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "public_board_settings_insert_owned"
  ON public.public_board_settings
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT projects.id
      FROM public.projects
      WHERE projects.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "public_board_settings_update_owned"
  ON public.public_board_settings
  FOR UPDATE
  USING (
    project_id IN (
      SELECT projects.id
      FROM public.projects
      WHERE projects.owner_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT projects.id
      FROM public.projects
      WHERE projects.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "public_board_settings_delete_owned"
  ON public.public_board_settings
  FOR DELETE
  USING (
    project_id IN (
      SELECT projects.id
      FROM public.projects
      WHERE projects.owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "board_announcements_owner_all" ON public.board_announcements;
DROP POLICY IF EXISTS "board_announcements_public_read" ON public.board_announcements;
DROP POLICY IF EXISTS "board_announcements_read_public_or_owned" ON public.board_announcements;
DROP POLICY IF EXISTS "board_announcements_insert_owned" ON public.board_announcements;
DROP POLICY IF EXISTS "board_announcements_update_owned" ON public.board_announcements;
DROP POLICY IF EXISTS "board_announcements_delete_owned" ON public.board_announcements;

CREATE POLICY "board_announcements_read_public_or_owned"
  ON public.board_announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.public_board_settings AS board
      WHERE board.id = board_announcements.board_id
        AND board.enabled = true
        AND board.visibility <> 'private'::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = board_announcements.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "board_announcements_insert_owned"
  ON public.board_announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = board_announcements.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "board_announcements_update_owned"
  ON public.board_announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = board_announcements.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = board_announcements.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "board_announcements_delete_owned"
  ON public.board_announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = board_announcements.project_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "feedback_notes_public_read" ON public.feedback_notes;
DROP POLICY IF EXISTS "feedback_notes_select_owned" ON public.feedback_notes;
DROP POLICY IF EXISTS "feedback_notes_read_public_or_owned" ON public.feedback_notes;

CREATE POLICY "feedback_notes_read_public_or_owned"
  ON public.feedback_notes
  FOR SELECT
  USING (
    is_public = true
    OR EXISTS (
      SELECT 1
      FROM public.feedback f
      JOIN public.projects p ON p.id = f.project_id
      WHERE f.id = feedback_notes.feedback_id
        AND p.owner_user_id = (SELECT auth.uid())
    )
  );
