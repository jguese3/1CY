import { useState, useEffect } from 'react';
import { Plus, X, Heart, Edit2, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type Moment = {
  id: number;
  image: string;
  caption: string;
  author: string;
  date: string;
  likes: number;
};

export function Moments() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMoment, setNewMoment] = useState({
    imageUrl: '',
    caption: '',
    author: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMoment, setEditMoment] = useState({
    imageUrl: '',
    caption: ''
  });

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/moments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const result = await response.json();
      if (result.success) {
        setMoments(result.data.sort((a: Moment, b: Moment) => b.id - a.id));
      }
    } catch (error) {
      console.error('Error fetching moments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoment.imageUrl.trim() || !newMoment.caption.trim() || !newMoment.author.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/moments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: newMoment.imageUrl,
            caption: newMoment.caption,
            author: newMoment.author
          })
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setMoments([result.data, ...moments]);
        setNewMoment({ imageUrl: '', caption: '', author: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating moment:', error);
    }
  };

  const handleLike = async (momentId: number) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/moments/${momentId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setMoments(moments.map(moment => 
          moment.id === momentId ? result.data : moment
        ));
      }
    } catch (error) {
      console.error('Error liking moment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this moment?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/moments/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setMoments(moments.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Error deleting moment:', error);
    }
  };

  const handleEditStart = (moment: Moment) => {
    setEditingId(moment.id);
    setEditMoment({
      imageUrl: moment.image,
      caption: moment.caption
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditMoment({
      imageUrl: '',
      caption: ''
    });
  };

  const handleEditSubmit = async (id: number) => {
    if (!editMoment.imageUrl.trim() || !editMoment.caption.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-504f5620/moments/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: editMoment.imageUrl,
            caption: editMoment.caption
          })
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setMoments(moments.map(m => 
          m.id === id ? result.data : m
        ));
        setEditingId(null);
        setEditMoment({
          imageUrl: '',
          caption: ''
        });
      }
    } catch (error) {
      console.error('Error updating moment:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading moments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Shared Moments</h2>
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
              Share Moment
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
                value={newMoment.author}
                onChange={(e) => setNewMoment({ ...newMoment, author: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="text"
                value={newMoment.imageUrl}
                onChange={(e) => setNewMoment({ ...newMoment, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <textarea
                value={newMoment.caption}
                onChange={(e) => setNewMoment({ ...newMoment, caption: e.target.value })}
                placeholder="Share what made this moment special..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Moment
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {moments.map((moment) => (
          <div key={moment.id} className="overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            {editingId === moment.id ? (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editMoment.imageUrl}
                    onChange={(e) => setEditMoment({ ...editMoment, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                  <textarea
                    value={editMoment.caption}
                    onChange={(e) => setEditMoment({ ...editMoment, caption: e.target.value })}
                    placeholder="Caption"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(moment.id)}
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
                <div className="aspect-square overflow-hidden relative group">
                  <ImageWithFallback
                    src={moment.image}
                    alt={moment.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditStart(moment)}
                      className="p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-blue-600 rounded shadow transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(moment.id)}
                      className="p-2 bg-white/90 hover:bg-white text-gray-600 hover:text-red-600 rounded shadow transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3">{moment.caption}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{moment.author}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(moment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLike(moment.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      <span className="text-sm font-medium">{moment.likes}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


