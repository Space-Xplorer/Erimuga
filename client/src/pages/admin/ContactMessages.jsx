import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Phone } from 'lucide-react';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/admin/contact-messages');
      setMessages(res.data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`/admin/contact-messages/${id}/read`, {});
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Contact Messages</h1>
      <p className="text-sm text-gray-500 mb-8">
        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up'}
      </p>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading messages…</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No messages yet.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-5 ${!msg.read ? 'bg-red-50/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {msg.read ? (
                    <MailOpen className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-[#b22222] shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{msg.name}</div>
                    <div className="text-xs text-gray-500">{msg.email}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {msg.phone && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 ml-6">
                  <Phone className="w-3 h-3" /> {msg.phone}
                </div>
              )}

              <p className="text-sm text-gray-700 ml-6 whitespace-pre-line">{msg.message}</p>

              {!msg.read && (
                <div className="mt-3 ml-6">
                  <button
                    onClick={() => markRead(msg._id)}
                    className="text-xs text-[#b22222] border border-[#b22222] px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Mark as read
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
