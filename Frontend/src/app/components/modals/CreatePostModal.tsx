import { motion, AnimatePresence } from 'motion/react';
import { X, Image, Video, MapPin, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { API } from '../../api/axios';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useApp();
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setCaption('');
    setImageUrl('');
    setVideoUrl('');
    setLocation('');
    setMediaType('image');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Pehle login karo'); return; }
    if (!caption.trim()) { toast.error('Caption zaroori hai'); return; }
    if (mediaType === 'image' && !imageUrl.trim()) { toast.error('Image URL daalo'); return; }
    if (mediaType === 'video' && !videoUrl.trim()) { toast.error('Video URL daalo'); return; }

    setIsLoading(true);
    try {
      const payload: any = { caption };
      if (mediaType === 'image') payload.image = imageUrl;
      if (mediaType === 'video') payload.video = videoUrl;
      if (location.trim()) payload.location = location;

      const res = await API.post('/posts', payload);
      const newPost = res.data.data;

      toast.success('Post create ho gayi!');
      onPostCreated?.(newPost);
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Post nahi bani, dobara try karo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Caption */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share your cultural experience..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none resize-none"
                  rows={3}
                  required
                />
              </div>

              {/* Media Type Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Media Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                      mediaType === 'image'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                      mediaType === 'video'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </button>
                </div>
              </div>

              {/* Image URL */}
              {mediaType === 'image' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                  <div className="relative">
                    <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="mt-2 w-full h-40 object-cover rounded-xl"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>
              )}

              {/* Video URL */}
              {mediaType === 'video' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  {videoUrl && (
                    <video
                      src={videoUrl}
                      controls
                      className="mt-2 w-full rounded-xl max-h-40"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">Direct .mp4 link ya hosted video URL</p>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Jaipur, Rajasthan"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Posting...' : 'Post'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}