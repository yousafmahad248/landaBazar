import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  const faqs = [
    {
      q: "Are these shoes authentic or replicas?",
      a: "Every single shoe listed on Thrifted Kicks is 100% authentic. We have an expert detailing and verification crew who cross-examine stitch density, material textures, serial tags, and construction shapes to filter out replica products."
    },
    {
      q: "What clean and hygiene procedures do you use?",
      a: "Hygiene is our highest priority. All shoes undergo a comprehensive 4-step processing cycle: multi-step organic washing, high-temperature steam cleaning at 130°C, UV-C sanitization, and athletic deodorizing. They arrive thoroughly disinfected and fresh-scented."
    },
    {
      q: "How can I buy a shoe? Is there a cart?",
      a: "Because thrift shoes are unique individual drops, we operate on a direct-chat model. On any product details page, click the green 'Chat on WhatsApp' button. It will open a chat with our dispatch assistant with a pre-filled interest message. Once you agree on details, we handle payments via Bank Transfer, EasyPaisa, JazzCash, or COD, and dispatch your order."
    },
    {
      q: "Can I return or exchange a shoe?",
      a: "Since thrifted shoes are sold in unique individual sizes, we cannot offer standard size returns. However, if the shoe condition deviates significantly from our online listing descriptions, contact us within 24 hours of delivery and we will arrange a complete refund."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 text-left text-gray-900">
      {/* Contact Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <span className="inline-block bg-[#ea580c]/10 text-brand-orange border border-[#ea580c]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-semibold">
              Get In Touch
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-gray-900 tracking-tight leading-tight uppercase">
              TALK TO THE SNEAKER ASSISTANT.
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Have a question about a specific sneaker size, need more detailed photos, or want to discuss a bulk custom deal? Hit us up across any of our direct channels.
            </p>
          </div>

          <div className="space-y-5">
            {/* WhatsApp Box */}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer block shadow-xs"
            >
              <div className="bg-white text-emerald-600 p-3 rounded-xl border border-emerald-200">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Chat on WhatsApp</p>
                <p className="text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors">+92 300 1234567</p>
              </div>
            </a>

            {/* Email Box */}
            <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200/60 rounded-2xl">
              <div className="bg-white text-brand-orange p-3 rounded-xl border border-gray-200">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Send an Email</p>
                <a href="mailto:support@thriftedkicks.com" className="text-sm font-bold text-gray-900 hover:text-brand-orange transition-colors">
                  support@thriftedkicks.com
                </a>
              </div>
            </div>

            {/* Address Box */}
            <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200/60 rounded-2xl">
              <div className="bg-white text-brand-orange p-3 rounded-xl border border-gray-200">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Visit Our Market Rail</p>
                <p className="text-sm font-bold text-gray-900">Light House Market, Karachi, Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-100 pb-2">Send a Message</h2>
          {formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3 text-emerald-600 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 mx-auto" />
              <h3 className="font-display font-bold text-lg text-gray-900">Message Dispatched!</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Thank you for contacting Thrifted Kicks! Our representative will review your message and reply via email or phone within 12 hours.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-2 text-xs font-bold text-brand-orange hover:underline cursor-pointer"
              >
                Submit another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Subject</label>
                <input
                  type="text"
                  placeholder="What is this inquiry about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your detailed query here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-brand-orange text-gray-900 text-sm rounded px-4 py-3 focus:outline-none transition-all font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold uppercase tracking-wider text-xs py-3.5 rounded transition-colors cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                Dispatch Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section id="faq" className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm">
            Quick, reliable answers to the most common shoe-shopping questions.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200/60 rounded-xl overflow-hidden transition-colors shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-sm sm:text-base text-gray-900 hover:text-brand-orange transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-5 h-5 text-brand-orange" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50/60 font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
