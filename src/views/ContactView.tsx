import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, 
  faEnvelope, 
  faClock, 
  faLocationDot, 
  faPaperPlane, 
  faCircleCheck 
} from '@fortawesome/free-solid-svg-icons';
import { isValidEmail } from '../services/firebase';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    let text = `🌸 *ORCHID FLAME — CONCIERGE INQUIRY* 🌸\n`;
    text += `• *Name*: ${name}\n`;
    text += `• *Phone*: ${phone}\n`;
    text += `• *Email*: ${email}\n`;
    text += `• *Message*: ${message}\n`;

    window.open(`https://wa.me/919026006766?text=${encodeURIComponent(text)}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-left bg-luxury-pattern" id="contact-view">
      <div className="border-b border-stone-200 pb-6 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#825936] font-bold block">
          Orchid Flame Studio Concierge
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl text-stone-900 font-medium break-words">
          Contact & Bespoke Inquiries
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm font-sans max-w-xl">
          Whether you are looking for custom wedding favors, festive corporate gifting, or bespoke fragrance formulations, our concierge team is delighted to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-4 sm:p-8 space-y-5 shadow-xs">
          <h2 className="font-serif text-lg font-bold text-stone-900">Send an Inquiry</h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-emerald-700 mx-auto" />
              <h4 className="font-serif font-bold text-emerald-900 text-base">Inquiry Sent via WhatsApp</h4>
              <p className="text-emerald-700 text-xs">Our concierge team will respond to your message shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alisha Roy"
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-stone-50 border border-stone-300 p-2.5 focus:outline-none focus:border-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="e.g. alisha@example.com"
                  className="w-full bg-stone-50 border border-stone-300 p-2.5 focus:outline-none focus:border-stone-900 focus:bg-white"
                />
                {emailError && (
                  <p className="text-[11px] text-red-600 font-bold pt-1">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1">Your Message or Custom Gifting Requirement</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the fragrances, quantities, or event date..."
                  className="w-full bg-stone-50 border border-stone-300 p-2.5 focus:outline-none focus:border-stone-900 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-3 bg-stone-900 hover:bg-[#C29B64] text-white text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md leading-tight text-center"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-xs flex-shrink-0" />
                <span>Submit & Chat on WhatsApp</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-botanical-wallpaper-faint border border-stone-200 p-4 sm:p-8 space-y-5 text-xs text-stone-700 shadow-xs">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200/80 pb-3">
              Studio & Workshop Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/90 backdrop-blur-xs p-3.5 border border-stone-200/80 shadow-2xs">
                <FontAwesomeIcon icon={faLocationDot} className="text-[#825936] text-sm mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 block">Heritage Workshop & Studio</span>
                  <span className="break-words">Mehrauli Heritage Corridor, New Delhi - 110030, India</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-3.5 border border-stone-200/80 shadow-2xs">
                <FontAwesomeIcon icon={faPhone} className="text-[#825936] text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 block">Phone & WhatsApp</span>
                  <a href="https://wa.me/919026006766" className="text-[#825936] hover:underline font-mono">
                    +91 90260 06766
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-3.5 border border-stone-200/80 shadow-2xs">
                <FontAwesomeIcon icon={faEnvelope} className="text-[#825936] text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 block">Concierge Email</span>
                  <span className="break-all">orchidflame24@gmail.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs p-3.5 border border-stone-200/80 shadow-2xs">
                <FontAwesomeIcon icon={faClock} className="text-[#825936] text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-stone-900 block">Operating Hours</span>
                  <span>Monday - Sunday: 9:00 AM - 10:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
