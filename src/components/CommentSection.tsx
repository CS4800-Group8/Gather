// AnN add: Reusable comment section component on 11/12
// Works for both API recipes (explore, favorites) and user recipes (profile posts)

'use client';

import { useState, useEffect } from 'react';
import AvatarImage from './AvatarImage';
import { resolveAvatarPreset } from '@/lib/avatarPresets';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    avatarId: string;
  };
}

interface CommentSectionProps {
  recipeId: string;           // Recipe ID (works for both types)
  recipeType: 'api' | 'user'; // Type discriminator
}

export default function CommentSection({ recipeId, recipeType }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // AnN add: Delete confirmation modal state on 11/12
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  // AnN add: Get current user on mount on 11/12
  useEffect(() => {
    const stored = localStorage.getItem('gatherUser');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUserId(user.id);
    }
  }, []);

  // AnN add: Fetch comments on mount on 11/12
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/comments?recipeId=${recipeId}&type=${recipeType}`
        );
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId, recipeType]);

  // AnN add: Post new comment on 11/12
  const handlePostComment = async () => {
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    if (!currentUserId) {
      alert('Please log in to comment');
      return;
    }

    if (newComment.length > 1000) {
      alert('Comment too long (max 1000 characters)');
      return;
    }

    setPosting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          type: recipeType,
          content: newComment,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  // AnN add: Show delete confirmation modal on 11/12
  const handleDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirm(true);
  };

  // AnN add: Confirm and delete comment on 11/12
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: commentToDelete,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentToDelete));
        setShowDeleteConfirm(false);
        setCommentToDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  // AnN add: Format time like "2 hours ago" on 11/12
  const formatTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays}d ago`;
  };

  return (
    <div className="p-6 bg-amber-50/30 rounded-xl h-full">
      {/* AnN edit: Styled comment header with count badge on 11/12 */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-bold text-amber-900 text-xl">
          Comments
        </h3>
        <span className="px-3 py-1 text-sm font-semibold bg-amber-200 text-amber-900 rounded-full">
          {comments.length}
        </span>
      </div>

      {/* AnN add: Comment input on 11/12 */}
      {currentUserId ? (
        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-amber-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-amber-600">
              {newComment.length}/1000 characters
            </span>
            <button
              onClick={handlePostComment}
              disabled={posting || !newComment.trim()}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl text-center">
          <p className="text-amber-700">Please log in to comment</p>
        </div>
      )}

      {/* AnN add: Comments list on 11/12 */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-amber-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-amber-600">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const avatarPreset = resolveAvatarPreset(comment.user.avatarId);
            const isOwnComment = comment.user.id === currentUserId;

            return (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition"
              >
                {/* AnN edit: Single-line layout with avatar left, name/time center, delete right on 11/12 */}
                <div className="flex-shrink-0">
                  <AvatarImage preset={avatarPreset} size="small" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* AnN edit: First line with name, time, delete - removed @username for more space on 11/12 */}
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-amber-900 whitespace-nowrap">
                        {comment.user.firstname} {comment.user.lastname}
                      </span>
                      <span className="text-xs text-amber-500">•</span>
                      <span className="text-xs text-amber-600 whitespace-nowrap">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    {isOwnComment && (
                      <button
                        onClick={() => handleDeleteClick(comment.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition flex-shrink-0 whitespace-nowrap"
                        aria-label="Delete comment"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  {/* Second line: Comment content */}
                  <p className="text-amber-800 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AnN add: Delete confirmation modal on 11/12 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-amber-900 mb-3">
              Delete Comment?
            </h3>
            <p className="text-sm text-amber-700 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCommentToDelete(null);
                }}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
