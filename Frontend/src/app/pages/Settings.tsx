import { motion } from 'motion/react';
import { useState } from 'react';
import { User, Lock, Bell, Globe, Moon, Sun, Save, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Settings() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);





  // 👇 YAHAN ADD KAR
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/user/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Avatar updated!");
        window.location.reload();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading avatar");
    }
  };

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  // Security settings
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light',
  });

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Profile updated successfully!');
      setIsSaving(false);
    }, 1000);
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill all password fields');
      return;
    }

    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      toast.success('Password changed successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
      setIsSaving(false);
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Notification preferences saved!');
      setIsSaving(false);
    }, 500);
  };

  const handleSavePreferences = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Preferences saved!');
      setIsSaving(false);
    }, 500);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-4">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === tab.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    whileHover={{ x: 5 }}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-semibold">{tab.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                    {/* Profile Picture */}
                    <div className="flex items-center gap-6 mb-8">
                      <input
                        type="file"
                        id="avatarInput"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                          {user?.avatar && (
                            <ImageWithFallback
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <motion.button
                          onClick={() => document.getElementById("avatarInput")?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg"
                        >
                          <Camera className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Profile Picture</h3>
                        <p className="text-sm text-gray-600">
                          JPG, PNG or GIF. Max size 2MB
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({ ...profileData, bio: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                          rows={4}
                        />
                      </div>

                      <motion.button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.current}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, current: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.new}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, new: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirm: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <motion.button
                        onClick={handleChangePassword}
                        disabled={isSaving}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Lock className="w-4 h-4" />
                        {isSaving ? 'Changing...' : 'Change Password'}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Notification Preferences
                    </h2>

                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {key} Notifications
                            </h3>
                            <p className="text-sm text-gray-600">
                              Receive notifications via {key}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                setNotifications({
                                  ...notifications,
                                  [key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      onClick={handleSaveNotifications}
                      disabled={isSaving}
                      className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </motion.button>
                  </div>
                )}

                {/* Preferences */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) =>
                            setPreferences({ ...preferences, language: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                          <option value="ta">தமிழ் (Tamil)</option>
                          <option value="te">తెలుగు (Telugu)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { value: 'light', icon: Sun, label: 'Light' },
                            { value: 'dark', icon: Moon, label: 'Dark' },
                            { value: 'auto', icon: Globe, label: 'Auto' },
                          ].map((theme) => (
                            <motion.button
                              key={theme.value}
                              onClick={() =>
                                setPreferences({ ...preferences, theme: theme.value })
                              }
                              className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 ${preferences.theme === theme.value
                                ? 'border-orange-600 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                                }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <theme.icon className="w-6 h-6" />
                              <span className="text-sm font-semibold">{theme.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        onClick={handleSavePreferences}
                        disabled={isSaving}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
