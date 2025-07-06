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
    <div className="flex flex-col h-full w-full">
      {/* Comments list (scrollable) */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 border-b border-black">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const isSelf = user && comment.user_id === user.id;
            return (
              <div key={comment.id} className={`w-full flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                <span
                  className="mb-1 ml-1"
                  style={{
                    fontFamily: 'Crimson Pro, serif',
                    fontWeight: 600,
                    fontStyle: 'italic',
                    fontSize: '15px',
                  }}
                >
                  {comment.user_email || `${comment.user_id.substring(0, 8)}...`}
                </span>
                <div
                  className={
                    isSelf
                      ? 'relative bg-blue-500 text-white border border-black px-6 py-3 text-base max-w-[80%] mr-2'
                      : 'relative bg-gray-200 text-black border border-black px-6 py-3 text-base max-w-[80%] ml-2'
                  }
                  style={{
                    fontFamily: 'Gothic A1, sans-serif',
                    fontWeight: 500,
                    fontSize: '15px',
                    borderTopLeftRadius: isSelf ? '12px' : '12px',
                    borderTopRightRadius: isSelf ? '12px' : '12px',
                    borderBottomLeftRadius: isSelf ? '12px' : '0px',
                    borderBottomRightRadius: isSelf ? '0px' : '12px',
                    marginBottom: '8px',
                  }}
                >
                  {comment.content}
                  {/* Bubble tail for self (right, bottom corner, seamless border, further outside, color match) */}
                  {isSelf && (
                    <>
                      {/* Border tail (behind) */}
                      <span
                        className="absolute"
                        style={{
                          right: '-10px',
                          bottom: '-1px',
                          width: 0,
                          height: 0,
                          borderTop: '10px solid transparent',
                          borderBottom: '0 solid transparent',
                          borderLeft: '10px solid black',
                          zIndex: 1,
                        }}
                      />
                      {/* Fill tail (front) */}
                      <span
                        className="absolute"
                        style={{
                          right: '-9px',
                          bottom: '0px',
                          width: 0,
                          height: 0,
                          borderTop: '9px solid transparent',
                          borderBottom: '0 solid transparent',
                          borderLeft: '9px solid #3b82f6',
                          zIndex: 2,
                        }}
                      />
                    </>
                  )}
                  {/* Bubble tail for others (left, bottom corner, seamless border, further outside, color match) */}
                  {!isSelf && (
                    <>
                      {/* Border tail (behind) */}
                      <span
                        className="absolute"
                        style={{
                          left: '-10px',
                          bottom: '-1px',
                          width: 0,
                          height: 0,
                          borderTop: '10px solid transparent',
                          borderBottom: '0 solid transparent',
                          borderRight: '10px solid black',
                          zIndex: 1,
                        }}
                      />
                      {/* Fill tail (front) */}
                      <span
                        className="absolute"
                        style={{
                          left: '-9px',
                          bottom: '0px',
                          width: 0,
                          height: 0,
                          borderTop: '9px solid transparent',
                          borderBottom: '0 solid transparent',
                          borderRight: '9px solid #e5e7eb',
                          zIndex: 2,
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500">No comments yet.</p>
        )}
      </div>
      {/* Input and send button fixed at the bottom */}
      <form onSubmit={handleSubmit} className="flex flex-col w-full border-t border-black bg-white p-0">
        <textarea
          className="w-full border-none outline-none px-4 py-3 resize-none text-base placeholder-gray-400"
          style={{
            minHeight: '48px',
            maxHeight: '80px',
            borderRadius: 0,
            borderBottom: '1px solid #000',
            fontFamily: 'Gothic A1, sans-serif',
            fontWeight: 500,
            fontSize: '15px',
          }}
          placeholder="Add a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting || !user}
        />
        <button
          type="submit"
          className="w-full border-t border-black hover:bg-gray-100 transition disabled:opacity-50"
          style={{
            borderRadius: 0,
            fontFamily: 'Crimson Pro, serif',
            fontWeight: 700,
            fontSize: '18px',
            fontStyle: 'bold',
            padding: '12px 0',
            color: 'black !important',
          }}
          disabled={isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? <span className="loading loading-spinner"></span> : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection; 