import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/useAuthStore';

const CommentSection = ({ projectId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  const fetchComments = useCallback(async () => {
    if (!projectId) return;
    
    // 1. Fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId);

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return;
    }
    if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
    }

    // 2. Get unique user IDs from comments
    const userIds = [...new Set(commentsData.map(c => c.user_id))];

    // 3. Fetch profiles for those user IDs
    const { data: profilesData, error: profilesError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

    if (profilesError) {
        console.error('Error fetching user profiles, will display IDs instead:', profilesError);
        setComments(commentsData); // Fallback to showing comments with IDs
        return;
    }

    // 4. Create a map for easy lookup
    const emailMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile.email;
        return acc;
    }, {});

    // 5. Combine comments with emails
    const enrichedComments = commentsData.map(comment => ({
        ...comment,
        user_email: emailMap[comment.user_id] || null
    }));

    setComments(enrichedComments);
  }, [projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('comments')
      .insert([
        { 
          content: newComment, 
          project_id: projectId, 
          user_id: user.id 
        }
      ]);
      
    if (error) {
      console.error('Error posting comment:', error);
    } else {
      setNewComment('');
      fetchComments(); // Refresh comments after posting
    }
    
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="chat chat-start">
              <div className="chat-header">
                {comment.user_email 
                  ? comment.user_email.split('@')[0] 
                  : `${comment.user_id.substring(0, 8)}...`
                }
              </div>
              <div className="chat-bubble chat-bubble-info">{comment.content}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting || !user}
          ></textarea>
        </div>
        <div className="form-control mt-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection; 