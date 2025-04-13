import { useState, useEffect } from "react";
import axios from "axios";
import {
  InstagramMedia,
  InstagramComment,
  PostCommentResponse,
} from "../types/instagram";

interface MediaFeedProps {
  accessToken: string;
}

interface CommentWithReplies extends InstagramComment {
  replies?: InstagramComment[];
}

const MediaFeed = ({ accessToken }: MediaFeedProps) => {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeComments, setActiveComments] = useState<{
    [key: string]: CommentWithReplies[];
  }>({});
  const [replyingTo, setReplyingTo] = useState<{
    mediaId: string;
    commentId?: string;
  } | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get<{ data: InstagramMedia[] }>(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,comments_count,like_count&access_token=${accessToken}`
        );
        setMedia(response.data.data);
      } catch (err) {
        setError("Failed to fetch media feed");
        console.error("Media fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [accessToken]);

  const fetchComments = async (mediaId: string) => {
    try {
      const response = await axios.get<{
        data: InstagramComment[];
        paging?: any;
      }>(
        `https://graph.instagram.com/${mediaId}/comments?fields=id,text,timestamp,from,replies,parent_id,like_count&access_token=${accessToken}`
      );

      // Process comments to nest replies under their parents
      const comments = response.data.data;
      const commentMap = new Map<string, CommentWithReplies>();
      const rootComments: CommentWithReplies[] = [];

      // First pass: create map of all comments
      comments.forEach((comment) => {
        if (!comment.parent_id) {
          const commentWithReplies: CommentWithReplies = {
            ...comment,
            replies: [],
          };
          commentMap.set(comment.id, commentWithReplies);
          rootComments.push(commentWithReplies);
        }
      });

      // Second pass: add replies to their parents
      comments.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        }
      });

      setActiveComments((prev) => ({
        ...prev,
        [mediaId]: rootComments,
      }));
    } catch (err) {
      console.error("Comments fetch error:", err);
    }
  };

  const postReply = async () => {
    if (!replyingTo || !replyText.trim()) return;

    try {
      const endpoint = replyingTo.commentId
        ? `https://graph.instagram.com/${replyingTo.commentId}/replies`
        : `https://graph.instagram.com/${replyingTo.mediaId}/comments`;

      await axios.post<PostCommentResponse>(
        endpoint,
        { message: replyText },
        {
          params: { access_token: accessToken },
        }
      );

      // Refresh comments after posting
      await fetchComments(replyingTo.mediaId);
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Post reply error:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {media.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Media Display */}
          <div className="p-4">
            {item.media_type === "IMAGE" && (
              <img
                src={item.media_url}
                alt={item.caption || "Instagram post"}
                className="w-full rounded-lg object-cover max-h-[600px]"
              />
            )}
            {item.media_type === "VIDEO" && (
              <video controls className="w-full rounded-lg max-h-[600px]">
                <source src={item.media_url} type="video/mp4" />
              </video>
            )}
          </div>

          {/* Caption and Stats */}
          <div className="px-4 py-3 border-b border-gray-100">
            {item.caption && (
              <p className="text-gray-800 mb-2">
                <span className="font-semibold">{item.username}</span>{" "}
                {item.caption}
              </p>
            )}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {item.like_count ?? 0}
                </span>
                <button
                  onClick={() => fetchComments(item.id)}
                  className="flex items-center hover:text-blue-500 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {item.comments_count ?? 0}
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          {activeComments[item.id] && (
            <div className="px-4 py-3">
              <h3 className="font-semibold mb-3 text-gray-700">Comments</h3>
              <div className="space-y-4">
                {activeComments[item.id].map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    {/* Parent Comment */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {comment.from?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm">
                              {comment.from?.username || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-800 text-sm mt-1">
                            {comment.text}
                          </p>
                          <div className="flex items-center mt-2 space-x-3 text-xs">
                            <span className="text-gray-500">
                              {comment.like_count ?? 0} likes
                            </span>
                            <button
                              onClick={() =>
                                setReplyingTo({
                                  mediaId: item.id,
                                  commentId: comment.id,
                                })
                              }
                              className="text-blue-500 hover:text-blue-600 cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="pl-12 space-y-3">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start space-x-3"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                              {reply.from?.username?.charAt(0).toUpperCase() ||
                                "U"}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="flex justify-between items-start">
                                  <span className="font-semibold text-xs">
                                    {reply.from?.username || "Unknown"}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(
                                      reply.timestamp
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-800 text-xs mt-1">
                                  {reply.text}
                                </p>
                                <div className="flex items-center mt-1 space-x-2 text-xs">
                                  <span className="text-gray-500">
                                    {reply.like_count ?? 0} likes
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          {replyingTo?.mediaId === item.id && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  replyingTo.commentId
                    ? "Write a reply..."
                    : "Write a comment..."
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={postReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaFeed;
