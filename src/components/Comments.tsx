import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

export function Comments({ questionId }: { questionId: Id<"questions"> }) {
  const comments = useQuery(api.comments.list, { questionId }) || [];
  const createComment = useMutation(api.comments.create);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        questionId,
        content: newComment.trim(),
      });
      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts or ask for help..."
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">
                      {comment.user?.name?.[0] || "?"}
                    </span>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  {comment.user?.name || "Anonymous"}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(comment._creationTime).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
