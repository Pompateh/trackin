import React, { useEffect, useState } from 'react';
// import { supabase } from '../../lib/supabaseClient';

const CommentSection = ({ projectId, taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // TODO: Replace with Supabase fetch
    // Example: fetch comments for projectId and taskId
    // supabase.from('comments').select('*').eq('project_id', projectId).eq('task_id', taskId)
    //   .then(({ data }) => setComments(data));
    setComments([]); // Placeholder
  }, [projectId, taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    // TODO: Add comment to Supabase
    setIsSubmitting(false);
    setNewComment('');
  };

  return (
    <div>
      <div className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="chat chat-start">
              <div className="chat-header">
                {comment.user_email}
                <time className="text-xs opacity-50 ml-2">
                  {new Date(comment.created_at).toLocaleTimeString()}
                </time>
              </div>
              <div className="chat-bubble">{comment.message}</div>
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
            disabled={isSubmitting}
          ></textarea>
        </div>
        <div className="form-control mt-2">
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection; 