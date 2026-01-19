import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
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
        <h2 className="text-2xl text-gray-800">Shared Moments</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Share Moment
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-white shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Your Name</label>
              <Input
                value={newMoment.author}
                onChange={(e) => setNewMoment({ ...newMoment, author: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Image URL</label>
              <Input
                value={newMoment.imageUrl}
                onChange={(e) => setNewMoment({ ...newMoment, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Caption</label>
              <Textarea
                value={newMoment.caption}
                onChange={(e) => setNewMoment({ ...newMoment, caption: e.target.value })}
                placeholder="Share what made this moment special..."
                rows={3}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Share Moment
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {moments.map((moment) => (
          <Card key={moment.id} className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
            {editingId === moment.id ? (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Image URL</label>
                  <Input
                    value={editMoment.imageUrl}
                    onChange={(e) => setEditMoment({ ...editMoment, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Caption</label>
                  <Textarea
                    value={editMoment.caption}
                    onChange={(e) => setEditMoment({ ...editMoment, caption: e.target.value })}
                    placeholder="Caption"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditSubmit(moment.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleEditCancel}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
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
                    <Button
                      onClick={() => handleEditStart(moment)}
                      variant="ghost"
                      size="sm"
                      className="bg-white/80 hover:bg-white text-gray-600 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(moment.id)}
                      variant="ghost"
                      size="sm"
                      className="bg-white/80 hover:bg-white text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-3">{moment.caption}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{moment.author}</p>
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
                      <span className="text-sm">{moment.likes}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}