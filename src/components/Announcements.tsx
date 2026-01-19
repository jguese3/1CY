import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
};

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/announcements`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const result = await response.json();
      if (result.success) {
        setAnnouncements(result.data.sort((a: Announcement, b: Announcement) => b.id - a.id));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !authorName.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/announcements`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newTitle,
            content: newContent,
            author: authorName
          })
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setAnnouncements([result.data, ...announcements]);
        setNewTitle('');
        setNewContent('');
        setAuthorName('');
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/announcements/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleEditStart = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleEditSubmit = async (id: number) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/announcements/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: editTitle,
            content: editContent
          })
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setAnnouncements(announcements.map(a => 
          a.id === id ? result.data : a
        ));
        setEditingId(null);
        setEditTitle('');
        setEditContent('');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Recent Announcements</h2>
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
              New Announcement
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Announcement title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your announcement..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Announcement
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            {editingId === announcement.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full px-3 py-2 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(announcement.id)}
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
                  <h3 className="text-xl font-semibold text-blue-900">{announcement.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(announcement.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => handleEditStart(announcement)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{announcement.content}</p>
                <p className="text-sm text-gray-600">Posted by {announcement.author}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


