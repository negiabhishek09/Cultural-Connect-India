import { useState, useEffect } from 'react';
import { Menu, X, User, Search } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = ['Home', 'Explore', 'Events', 'Local Businesses', 'About'];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">CC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">
                Cultural Connect
              </span>
              <span className="text-xs text-orange-600 -mt-1">India</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-700 hover:text-orange-600 transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Right Side Icons & Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="p-2 text-gray-700 hover:text-orange-600 transition-colors">
              <Search size={20} />
            </button>
            <button className="px-6 py-2 text-orange-600 border-2 border-orange-600 rounded-full hover:bg-orange-50 transition-all duration-200">
              Login
            </button>
            <button className="p-2 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-200">
              <User size={18} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 bg-white">
            {menuItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="block py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-4 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="flex items-center gap-3 px-4 mt-4">
              <button className="flex-1 px-6 py-2 text-orange-600 border-2 border-orange-600 rounded-full hover:bg-orange-50 transition-all">
                Login
              </button>
              <button className="p-2 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white">
                <User size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
