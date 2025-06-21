import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const useProjectStore = create((set, get) => ({
  project: null,
  role: null,
  board: null,
  tasks: [],
  comments: [],
  loading: true,
  isUploading: false,
  members: [],

  fetchProjectData: async (projectId, userId) => {
    set({ loading: true, project: null, role: null, board: null, tasks: [], comments: [], members: [] });
    try {
      // 1. Fetch the project (if user is a member, this will succeed)
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // 2. Fetch the user's membership row for this project
      const { data: memberRows, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (memberError || !memberRows || memberRows.length === 0) throw new Error('No membership found');
      const role = memberRows[0].role;

      // 3. If admin, fetch all members
      let allMembers = [];
      if (role === 'admin') {
        const { data: adminMembers, error: adminError } = await supabase
          .rpc('get_project_members_for_admin', { p_project_id: projectId });
        
        if (adminError) {
          console.error('Error fetching project members:', adminError);
          toast.error(`Failed to fetch project members: ${adminError.message}`);
        } else if (adminMembers) {
          allMembers = adminMembers;
        }
      }

      // 4. Fetch board, tasks, comments as before
      let boardData = null;
      let boardError = null;
      try {
        const boardRes = await supabase.from('boards').select('*').eq('project_id', projectId).single();
        boardData = boardRes.data;
        boardError = boardRes.error;
        console.log('[DEBUG] Board fetch:', boardData, boardError);
      } catch (e) {
        boardError = e;
        console.log('[DEBUG] Board fetch exception:', e);
      }
      // If no board exists, auto-create one
      if (!boardData && !boardError) {
        console.log('[DEBUG] No board found, attempting to create one...');
        const { data: newBoard, error: createBoardError } = await supabase.from('boards').insert({ project_id: projectId, board_data: {} }).select().single();
        console.log('[DEBUG] Board creation result:', newBoard, createBoardError);
        if (!createBoardError) {
          boardData = newBoard;
        }
      }
      if (boardError && boardError.code !== 'PGRST116') throw boardError;

      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*, assigned_to_user:users(email)').eq('project_id', projectId);
      if (tasksError) throw tasksError;

      const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*, user:users(email)').eq('project_id', projectId).order('timestamp', { ascending: true });
      if (commentsError) throw commentsError;

      set({
        project: projectData,
        role,
        board: boardData,
        tasks: tasksData,
        comments: commentsData,
        loading: false,
        members: allMembers
      });
    } catch (error) {
      toast.error(`Error fetching project data: ${error.message}`);
      set({ loading: false });
    }
  },

  saveBoard: async (boardData) => {
    const { project, board } = get();
    if (!project) return;
    set({ isUploading: true });

    try {
      if (board) {
        const { error } = await supabase.from('boards').update({ board_data: boardData, updated_at: new Date().toISOString() }).eq('project_id', project.id);
        if (error) throw error;
      } else {
        const { data: newBoard, error } = await supabase.from('boards').insert({ project_id: project.id, board_data: boardData }).select().single();
        if (error) throw error;
        set({ board: newBoard });
      }
    } catch(error) {
      toast.error(error.message);
    } finally {
      set({ isUploading: false });
    }
  },
  
  addTask: async (title, assigned_to) => {
    const { project } = get();
    try {
      const { data, error } = await supabase.from('tasks').insert({ project_id: project.id, title, assigned_to }).select('*, assigned_to_user:users(email)').single();
      if (error) throw error;
      set((state) => ({ tasks: [...state.tasks, data] }));
      toast.success('Task added!');
    } catch(error) {
      toast.error(error.message);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const { data, error } = await supabase.from('tasks').update({ status }).eq('id', taskId).select('*, assigned_to_user:users(email)').single();
      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map(task => task.id === taskId ? data : task)
      }));
      toast.success('Task status updated!');
    } catch (error) {
      toast.error(error.message);
    }
  },

  addComment: async (content) => {
    const { project } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !project) return;

    try {
      const { data, error } = await supabase.from('comments').insert({ project_id: project.id, content, user_id: user.id }).select('*, user:users(email)').single();
      if (error) throw error;
      set((state) => ({ comments: [...state.comments, data] }));
    } catch(error) {
      toast.error(error.message);
    }
  }
}));

export default useProjectStore; 