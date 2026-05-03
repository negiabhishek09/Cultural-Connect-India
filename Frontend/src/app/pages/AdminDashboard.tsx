import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Package, CalendarDays, Compass, MessageCircle } from 'lucide-react';
import { API } from '../api/axios';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then((res) => setStats(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Events', value: stats.totalEvents, icon: CalendarDays, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: 'Explore Items', value: stats.totalExploreItems, icon: Compass, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
    { label: 'Community Posts', value: stats.totalPosts, icon: MessageCircle, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50' },
  ] : [];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading stats...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            className={`${stat.bg} rounded-2xl p-5 flex flex-col gap-3`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h3>
        <div className="space-y-3">
          {stats?.recentUsers?.map((user: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(user.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}