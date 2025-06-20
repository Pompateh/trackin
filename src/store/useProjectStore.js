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

  fetchProjectData: async (projectId, userId) => {
    set({ loading: true, project: null, role: null, board: null, tasks: [], comments: [] });
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`*, project_members!inner(role)`)
        .eq('id', projectId)
        .eq('project_members.user_id', userId)
        .single();
      
      if (projectError) throw projectError;
      
      const role = projectData.project_members[0].role;
      delete projectData.project_members;

      const { data: boardData, error: boardError } = await supabase.from('boards').select('*').eq('project_id', projectId).single();
      if (boardError && boardError.code !== 'PGRST116') throw boardError;

      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*, assigned_to_user:users(email)').eq('project_id', projectId);
      if (tasksError) throw tasksError;

      const { data: commentsData, error: commentsError } = await supabase.from('comments').select('*, user:users(email)').eq('project_id', projectId).order('timestamp', { ascending: true });
      if (commentsError) throw commentsError;

      set({ project: projectData, role, board: boardData, tasks: tasksData, comments: commentsData, loading: false });
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