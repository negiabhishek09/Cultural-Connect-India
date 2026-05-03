import { motion } from 'framer-motion'; // ✅ fixed import
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ModernNavbar } from '../components/ModernNavbar';
import { Footer } from '../components/Footer';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EventRegistrationModal } from '../components/modals/EventRegistrationModal';
import { API } from '../api/axios';

export function Events() {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get('/events');
        setEvents(res?.data?.data || []); // ✅ safe access
      } catch (err) {
        console.error('Events fetch error:', err);
        setEvents([]); // ✅ fallback
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernNavbar />

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Cultural{' '}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Events
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join upcoming cultural festivals and events across India
            </p>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20 text-gray-500 text-lg">
              Loading events...
            </div>
          )}

          {/* No Data */}
          {!loading && events.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-lg">
              No events found.
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event._id || index} // ✅ fallback key
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="md:flex">
                  
                  {/* Image */}
                  <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    {event.tag && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                          {event.tag}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:w-3/5 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {event.name}
                    </h3>

                    <div className="space-y-3 mb-6">

                      {/* Date */}
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
                        <span>
                          {event.startDate
                            ? new Date(event.startDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="w-5 h-5 text-orange-600 shrink-0" />
                        <span>
                          {event.startDate
                            ? new Date(event.startDate).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                      </div>

                      {/* Location (✅ fixed anchor tag) */}
                      {event.location && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                          <span className="underline underline-offset-2">
                            {event.location}
                          </span>
                        </a>
                      )}

                      {/* Venue */}
                      {event.venue && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Users className="w-5 h-5 text-orange-600 shrink-0" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Entry Fee</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {event.price ? `₹ ${event.price}` : 'Free'}
                        </p>
                      </div>

                      <motion.button
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        Register Now
                      </motion.button>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      <Footer />

      {/* Modal */}
      {selectedEvent && (
        <EventRegistrationModal
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </div>
  );
}