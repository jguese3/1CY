import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Get all announcements
app.get('/make-server-504f5620/announcements', async (c) => {
  try {
    const announcements = await kv.getByPrefix('announcement:');
    return c.json({ success: true, data: announcements });
  } catch (error) {
    console.log('Error fetching announcements:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create announcement
app.post('/make-server-504f5620/announcements', async (c) => {
  try {
    const body = await c.req.json();
    const { title, content, author } = body;
    
    if (!title || !content || !author) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const announcement = {
      id: Date.now(),
      title,
      content,
      author,
      date: new Date().toISOString().split('T')[0]
    };

    await kv.set(`announcement:${announcement.id}`, announcement);
    return c.json({ success: true, data: announcement });
  } catch (error) {
    console.log('Error creating announcement:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete announcement
app.delete('/make-server-504f5620/announcements/:id', async (c) => {
  try {
    const announcementId = c.req.param('id');
    await kv.del(`announcement:${announcementId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting announcement:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update announcement
app.put('/make-server-504f5620/announcements/:id', async (c) => {
  try {
    const announcementId = c.req.param('id');
    const body = await c.req.json();
    const { title, content } = body;
    
    if (!title || !content) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const existing = await kv.get(`announcement:${announcementId}`);
    if (!existing) {
      return c.json({ success: false, error: 'Announcement not found' }, 404);
    }

    const updated = {
      ...existing,
      title,
      content
    };

    await kv.set(`announcement:${announcementId}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating announcement:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all events
app.get('/make-server-504f5620/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:');
    return c.json({ success: true, data: events });
  } catch (error) {
    console.log('Error fetching events:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create event
app.post('/make-server-504f5620/events', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, date, time, location } = body;
    
    if (!title || !date || !time) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const event = {
      id: Date.now(),
      title,
      description: description || '',
      date,
      time,
      location: location || '',
      attendees: 0
    };

    await kv.set(`event:${event.id}`, event);
    return c.json({ success: true, data: event });
  } catch (error) {
    console.log('Error creating event:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// RSVP to event
app.post('/make-server-504f5620/events/:id/rsvp', async (c) => {
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }

    event.attendees = (event.attendees || 0) + 1;
    await kv.set(`event:${eventId}`, event);
    
    return c.json({ success: true, data: event });
  } catch (error) {
    console.log('Error RSVP to event:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete event
app.delete('/make-server-504f5620/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    await kv.del(`event:${eventId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting event:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update event
app.put('/make-server-504f5620/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();
    const { title, description, date, time, location } = body;
    
    if (!title || !date || !time) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const existing = await kv.get(`event:${eventId}`);
    if (!existing) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }

    const updated = {
      ...existing,
      title,
      description: description || '',
      date,
      time,
      location: location || ''
    };

    await kv.set(`event:${eventId}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating event:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all moments
app.get('/make-server-504f5620/moments', async (c) => {
  try {
    const moments = await kv.getByPrefix('moment:');
    return c.json({ success: true, data: moments });
  } catch (error) {
    console.log('Error fetching moments:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create moment
app.post('/make-server-504f5620/moments', async (c) => {
  try {
    const body = await c.req.json();
    const { image, caption, author } = body;
    
    if (!image || !caption || !author) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const moment = {
      id: Date.now(),
      image,
      caption,
      author,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    await kv.set(`moment:${moment.id}`, moment);
    return c.json({ success: true, data: moment });
  } catch (error) {
    console.log('Error creating moment:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Like moment
app.post('/make-server-504f5620/moments/:id/like', async (c) => {
  try {
    const momentId = c.req.param('id');
    const moment = await kv.get(`moment:${momentId}`);
    
    if (!moment) {
      return c.json({ success: false, error: 'Moment not found' }, 404);
    }

    moment.likes = (moment.likes || 0) + 1;
    await kv.set(`moment:${momentId}`, moment);
    
    return c.json({ success: true, data: moment });
  } catch (error) {
    console.log('Error liking moment:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete moment
app.delete('/make-server-504f5620/moments/:id', async (c) => {
  try {
    const momentId = c.req.param('id');
    await kv.del(`moment:${momentId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting moment:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update moment
app.put('/make-server-504f5620/moments/:id', async (c) => {
  try {
    const momentId = c.req.param('id');
    const body = await c.req.json();
    const { image, caption } = body;
    
    if (!image || !caption) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const existing = await kv.get(`moment:${momentId}`);
    if (!existing) {
      return c.json({ success: false, error: 'Moment not found' }, 404);
    }

    const updated = {
      ...existing,
      image,
      caption
    };

    await kv.set(`moment:${momentId}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log('Error updating moment:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);