import { useState, useEffect } from 'react';
import { Menu, X, User, Search, ShoppingBag, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// import { useNavigate, useLocation } from 'react-router';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../imports/AZ1HylrRIHU2bgVKHbaC2A-AZ1HylrSZmM6JSLqFu-l_w.jpg';
import { useApp } from '../context/AppContext';
import { CartPanel } from './modals/CartPanel';
import { toast } from 'sonner';

export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ clearNotifications bhi lo
  const { cart, notifications, clearNotifications, user, logout } = useApp();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Events', path: '/events' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Community', path: '/community' },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setShowUserMenu(false);
  };

  // ✅ Bell click handler — notification message + clear
  const handleBellClick = () => {
    if (notifications > 0) {
      toast.info(`You have ${notifications} order${notifications > 1 ? 's' : ''} in process! 🛍️`);
      clearNotifications();
    } else {
      toast.info('No new notifications');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:8000/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Profile updated");
        window.location.reload();
      }
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
          : 'bg-transparent'
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
            >
              <img
                src={logoImg}
                alt="Cultural Connect India"
                className="h-12 w-12 rounded-xl shadow-lg object-cover"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Cultural Connect
                </span>
                <span className="text-xs text-indigo-600 -mt-1 font-semibold">India</span>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`px-6 py-2 rounded-full font-medium transition-all relative ${isActive(item.path)
                    ? 'text-orange-600'
                    : 'text-gray-700 hover:text-orange-600'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full"
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-2">

              {/* ✅ Bell — ab dynamic hai */}
              <motion.button
                className="p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleBellClick}
              >
                <Bell size={20} />
                {notifications > 0 && (
                  <motion.span
                    key={notifications}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              {/* Cart */}
              <motion.button
                className="p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCart(true)}
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </motion.button>

              {/* Search */}
              <motion.button
                className="p-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={20} />
              </motion.button>

              {/* Login / User Menu */}
              {user ? (
                <div className="relative">
                  <motion.button
                    className="p-2 w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User size={20} />
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 border-b border-gray-100 text-center">
                          {user?.avtar && (
                            <img
                              src={user.avtar}
                              alt="Profile"
                              className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                            />
                          )}
                          <p className="font-semibold text-gray-900">{user?.name || 'Guest User'}</p>
                          <p className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</p>
                        </div>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors text-gray-700"
                          onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                        >
                          My Profile
                        </button>
                        {user?.role === "ADMIN" && (
                          <button
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors text-gray-700"
                            onClick={() => {
                              navigate("/admin");
                              setShowUserMenu(false);
                            }}
                          >
                            Admin Panel
                          </button>
                        )}
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors text-gray-700"
                          onClick={() => { navigate('/marketplace'); setShowUserMenu(false); }}
                        >
                          Saved Items
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors text-gray-700"
                          onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                        >
                          Settings
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-red-600 border-t border-gray-100"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  className="px-6 py-2.5 text-orange-600 border-2 border-orange-600 rounded-full hover:bg-orange-50 transition-all font-semibold"
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(251, 146, 60, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>

          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="lg:hidden py-4 border-t border-gray-200 bg-white"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {menuItems.map((item) => (
                  <motion.button
                    key={item.name}
                    onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                    className={`block w-full text-left py-3 px-4 ${isActive(item.path)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:bg-orange-50'
                      } transition-colors`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <div className="flex items-center gap-3 px-4 mt-4">
                  <button
                    className="flex-1 px-6 py-2 text-orange-600 border-2 border-orange-600 rounded-full hover:bg-orange-50 transition-all"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button
                    className="p-2 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white"
                    onClick={() => navigate('/profile')}
                  >
                    <User size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                className="py-4 border-t border-gray-200 bg-white"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, events, cultures..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    autoFocus
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.nav>

      <CartPanel isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}