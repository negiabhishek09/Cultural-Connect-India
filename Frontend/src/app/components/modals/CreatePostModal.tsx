import { motion, AnimatePresence } from 'motion/react';
import { X, Image, Video, MapPin, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setCaption('');
    setMediaFile(null);
    setPreview(null);
    setLocation('');
    setMediaType('image');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleMediaTypeChange = (type: 'image' | 'video') => {
    setMediaType(type);
    setMediaFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Pehle login karo'); return; }
    if (!caption.trim()) { toast.error('Caption zaroori hai'); return; }
    if (!mediaFile) { toast.error(mediaType === 'image' ? 'Photo select karo' : 'Video select karo'); return; }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append(mediaType, mediaFile);
      if (location.trim()) formData.append('location', location);

      const res = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Post create ho gayi!');
      onPostCreated?.(res.data.data);
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
                    onClick={() => handleMediaTypeChange('image')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                      mediaType === 'image'
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('video')}
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

              {/* File Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {mediaType === 'image' ? 'Photo' : 'Video'} Select karo
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!preview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">
                      {mediaType === 'image' ? 'Photo choose karo' : 'Video choose karo'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {mediaType === 'image' ? 'JPG, PNG, WEBP' : 'MP4, MOV, AVI'}
                    </span>
                  </button>
                ) : (
                  <div className="relative">
                    {mediaType === 'image' ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ) : (
                      <video
                        src={preview}
                        controls
                        className="w-full rounded-xl max-h-48"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1 bg-black/60 text-white text-xs rounded-lg hover:bg-black/80 transition-all"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

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