import { useState, useEffect } from 'react';
import { Plus, X, MapPin, Clock, Users, Edit2, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
};

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/events`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const result = await response.json();
      if (result.success) {
        setEvents(result.data.sort((a: Event, b: Event) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newEvent)
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setEvents([...events, result.data].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          location: ''
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleRSVP = async (eventId: number) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/events/${eventId}/rsvp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setEvents(events.map(event => 
          event.id === eventId ? result.data : event
        ));
      }
    } catch (error) {
      console.error('Error RSVP to event:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/events/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEditStart = (event: Event) => {
    setEditingId(event.id);
    setEditEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: ''
    });
  };

  const handleEditSubmit = async (id: number) => {
    if (!editEvent.title.trim() || !editEvent.date || !editEvent.time) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/events/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editEvent)
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setEvents(events.map(e => 
          e.id === id ? result.data : e
        ).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        setEditingId(null);
        setEditEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          location: ''
        });
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Plan Event
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Event location"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event details..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            {editingId === event.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    value={editEvent.title}
                    onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                    placeholder="Event name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={editEvent.date}
                      onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={editEvent.time}
                      onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editEvent.location}
                    onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                    placeholder="Event location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    placeholder="Event details..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(event.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-blue-900">{event.title}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditStart(event)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })} at {event.time}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{event.attendees} attending</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRSVP(event.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  RSVP
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


