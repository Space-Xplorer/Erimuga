import { useState } from 'react';
import axios from '../config/axios';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    const tid = toast.loading('Sending message…');
    try {
      await axios.post('/contact', form);
      toast.dismiss(tid);
      toast.success('Message sent! We will get back to you soon.');
      setSent(true);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (sent) {
    return (
      <div className="isolate bg-[#fffaf5] px-6 py-32 lg:px-8">
        <div className="container mx-auto max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-[#b22222]/10 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Received!</h2>
          <p className="text-gray-600">Thank you for reaching out. We will get back to you as soon as possible.</p>
          <button onClick={() => setSent(false)} className="mt-6 text-sm text-[#b22222] underline hover:text-red-700">
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="isolate bg-[#fffaf5] px-6 sm:py-32 lg:px-8">
      <div className="container mx-auto max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-[#b22222]/10">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="text-4xl font-bold tracking-tight text-[#b22222] sm:text-5xl">Contact Us</h2>
          <p className="mt-2 text-lg text-gray-700">We'll get back to you as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Name <span className="text-[#b22222]">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your name"
              required
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-700 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Email <span className="text-[#b22222]">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-700 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Phone number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              placeholder="10-digit mobile number"
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-700 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Message <span className="text-[#b22222]">*</span></label>
            <textarea
              rows={4}
              value={form.message}
              onChange={set('message')}
              placeholder="Write your message…"
              required
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="block w-full rounded-md bg-[#b22222] px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-md hover:bg-[#8b1717] disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Sending…' : "Let's Talk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
