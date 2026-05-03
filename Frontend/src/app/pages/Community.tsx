import { motion } from 'motion/react';
import { Heart, MessageCircle, Bookmark, Plus, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useApp } from '../context/AppContext';
import { CreatePostModal } from '../components/modals/CreatePostModal';
import { toast } from 'sonner';
import { API } from '../api/axios';

export function Community() {
  const { savedItems, toggleSave, user } = useApp();
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [createPostModal, setCreatePostModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');

  const fetchPosts = async () => {
    try {
      // ✅ FIX: /community → /posts (AdminPanel delete bhi /posts se karta hai)
      const res = await API.get('/posts');
      setAllPosts(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();

    // ✅ FIX: Jab user admin tab se wapas aaye — fresh data aaye
    window.addEventListener('focus', fetchPosts);
    return () => window.removeEventListener('focus', fetchPosts);
  }, []);

  const handleToggleLike = async (postId: string) => {
    if (!user) { toast.error('Pehle login karo'); return; }

    setAllPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );

    try {
      // ✅ FIX: /community/:id/like → /posts/:id/like
      await API.post(`/posts/${postId}/like`);
    } catch (err) {
      // Revert on failure
      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
      toast.error('Like save nahi hua');
    }
  };

  const handleAddComment = async (postId: string, e?: any) => {
    e?.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText || !user) return;

    try {
      // ✅ FIX: /posts/:id/comments — backend "content" expect karta hai
      const res = await API.post(`/posts/${postId}/comments`, {
        content: commentText,
      });

      const savedComment = res.data.data;
      const newComment = {
        _id: savedComment._id,
        userId: {
          name: savedComment.userId?.name || user.name,
          avatar: savedComment.userId?.avatar || user.avatar || '',
        },
        content: savedComment.content || savedComment.text,
        createdAt: savedComment.createdAt,
      };

      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        )
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      toast.success('Comment add ho gaya!');
    } catch (err) {
      toast.error('Comment save nahi hua, dobara try karo');
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCreatePost = async (e?: any) => {
    e?.preventDefault();
    if (!text.trim()) { toast.error('Kuch likho pehle'); return; }

    try {
      const formData = new FormData();
      formData.append('caption', text);
      if (image) formData.append('image', image);

      // ✅ FIX: /community → /posts
      const res = await API.post('/posts', formData);
      setAllPosts((prev) => [res.data.data, ...prev]);
      setText('');
      setImage(null);
      setPreview(null);
      toast.success('Post create ho gayi!');
    } catch (err: any) {
      toast.error('Post nahi bani');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* POST BOX */}
          <div className="mb-10 bg-white p-6 rounded-2xl shadow">
            <textarea
              placeholder="Write something..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border rounded-xl mb-3"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && (
              <img src={preview} className="mt-3 w-40 rounded-lg" alt="preview" />
            )}
            <button
              type="button"
              onClick={handleCreatePost}
              className="mt-3 px-5 py-2 bg-orange-600 text-white rounded-xl"
            >
              Post
            </button>
          </div>

          {/* HEADER */}
          <motion.div
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Community{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Feed
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Share and explore cultural experiences from across India
              </p>
            </div>

            <motion.button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCreatePostModal(true)}
            >
              <Plus className="w-5 h-5" />
              Create Post
            </motion.button>
          </motion.div>

          {/* POSTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post: any, index: number) => {
              const isLiked = post.isLiked || false;
              const isSaved = savedItems.includes(post._id);
              const likesCount = post.likeCount || 0;

              return (
                <motion.div
                  key={post._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 p-4">
                    <ImageWithFallback
                      src={post.userId?.avatar || '/default-avatar.png'}
                      alt={post.userId?.name || 'User'}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {post.userId?.name || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {post.userId?.location || 'India'}
                      </p>
                    </div>
                  </div>

                  {/* Post image */}
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Caption */}
                  <div className="p-4">
                    <p className="text-gray-900">{post.caption}</p>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post._id)}
                          className="flex items-center gap-1 text-gray-600"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              isLiked ? 'text-red-500 fill-red-500' : ''
                            }`}
                          />
                          <span>{likesCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleComments(post._id)}
                          className="flex items-center gap-1 text-gray-600"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                      </div>

                      <button type="button" onClick={() => toggleSave(post._id)}>
                        <Bookmark
                          className={`w-5 h-5 ${
                            isSaved ? 'text-yellow-500 fill-yellow-500' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Comments */}
                  {showComments[post._id] && (
                    <div className="px-4 pb-4">
                      <div className="space-y-2 mb-3">
                        {post.comments?.map((c: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <img
                              src={c.userId?.avatar || '/default-avatar.png'}
                              className="w-6 h-6 rounded-full object-cover mt-0.5"
                              alt={c.userId?.name}
                            />
                            <div>
                              <span className="font-semibold">{c.userId?.name}: </span>
                              <span>{c.content}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Comment likho..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id, e);
                          }}
                          className="flex-1 border rounded-lg px-3 py-1 text-sm"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleAddComment(post._id, e)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />

      <CreatePostModal
        isOpen={createPostModal}
        onClose={() => setCreatePostModal(false)}
      />
    </div>
  );
}