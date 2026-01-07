import React, { useState } from 'react'
import { FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaWhatsapp, FaCheckCircle } from 'react-icons/fa'

export default function Theme2({ data }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Local handling
    console.log('Landing Page Lead (Theme 2):', formData)
    setSubmitted(true)
  }

  const {
    title,
    description,
    email,
    phone,
    logo,
    cover,
    media = [],
    facebook,
    instagram,
    twitter,
    linkedin,
    url
  } = data

  return (
    <div className="min-h-screen bg-[#0b1120] font-serif text-gray-100">
      {/* Header */}
      <header className="bg-[#111827] shadow-sm sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors">
                <FaEnvelope className="text-blue-500" />
                <span className="text-sm font-medium">{email}</span>
              </a>
            )}
          </div>
          <div className="hidden md:flex items-center gap-6">
             {facebook && <a href={facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors"><FaFacebook size={20} /></a>}
             {instagram && <a href={instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors"><FaInstagram size={20} /></a>}
             {twitter && <a href={twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors"><FaTwitter size={20} /></a>}
             {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors"><FaLinkedin size={20} /></a>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative bg-[#0b1120] text-white overflow-hidden border-b border-gray-800">
        {cover && (
           <div className="absolute inset-0 z-0">
             <img src={cover} alt="Cover" className="w-full h-full object-cover opacity-30" />
           </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center">
          {logo && (
            <img src={logo} alt="Logo" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-800 shadow-lg mb-6 object-cover bg-gray-800" />
          )}
          <h1 className="text-5xl font-bold mb-6 leading-tight drop-shadow-lg">{title || 'Welcome to Our Service'}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-12">
        {/* Content Section */}
        <div className="space-y-8">
          <div className="bg-[#1f2937] p-8 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-gray-100 mb-4">About Us</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {description || 'Detailed description of your services and offerings.'}
            </p>
          </div>

          {/* Media Grid */}
          {media.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {media.map((src, idx) => (
                <div key={idx} className="aspect-video bg-[#1f2937] rounded-lg overflow-hidden border border-gray-700">
                  <img src={src} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-[#1f2937] p-8 rounded-xl shadow-lg border-t-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-100 mb-2 text-center">Contact Us</h3>
            <p className="text-gray-400 text-sm mb-6 text-center">Fill out the form below to get in touch.</p>

            {submitted ? (
              <div className="text-center py-8">
                <FaCheckCircle className="text-green-500 w-12 h-12 mx-auto mb-3" />
                <h4 className="font-bold text-gray-100">Message Sent!</h4>
                <p className="text-sm text-gray-400 mt-1">We'll get back to you soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-blue-400 text-sm hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required
                  className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-[#4b5563] text-white placeholder-gray-400 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-[#4b5563] text-white placeholder-gray-400 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-[#4b5563] text-white placeholder-gray-400 outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <textarea 
                  placeholder="How can we help?" 
                  rows="4"
                  className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-[#4b5563] text-white placeholder-gray-400 outline-none transition-all resize-none"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all transform active:scale-95">
                  Send Message
                </button>
              </form>
            )}

            {/* Direct Contact */}
            <div className="mt-8 pt-6 border-t border-gray-600 space-y-3">
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-gray-300 hover:text-blue-400 text-sm">
                  <FaEnvelope className="text-gray-500" /> {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-gray-300 hover:text-blue-400 text-sm">
                  <FaPhone className="text-gray-500" /> {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {title}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
