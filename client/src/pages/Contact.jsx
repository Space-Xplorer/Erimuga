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

  const field = 'block w-full rounded-lg border border-paper-deep bg-paper px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  if (sent) {
    return (
      <div className="bg-paper px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-xl border border-paper-deep bg-paper-dim p-10 text-center">
          <p className="eyebrow">Thank you</p>
          <h2 className="mt-3 font-display text-3xl text-ink">Message received</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 border-b border-ink/25 pb-1 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper px-6 py-16 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <p className="eyebrow">Get in touch</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Contact us</h1>
          <p className="mt-3 text-sm text-ink-soft">We'll get back to you as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Name *</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Your name" required className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Phone number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              placeholder="10-digit mobile number"
              className={field}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Message *</label>
            <textarea rows={5} value={form.message} onChange={set('message')} placeholder="Write your message…" required className={field} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
