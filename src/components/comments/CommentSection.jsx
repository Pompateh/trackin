import React, { useState } from 'react';
import useProjectStore from '../../store/useProjectStore';

const CommentSection = () => {
  const { comments, addComment } = useProjectStore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await addComment(newComment);
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
                {comment.user.email}
                <time className="text-xs opacity-50 ml-2">
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </time>
              </div>
              <div className="chat-bubble">{comment.content}</div>
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