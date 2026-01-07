import React, { useState } from 'react'
import { FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaWhatsapp, FaCheckCircle } from 'react-icons/fa'

export default function Theme1({ data }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Local handling - do NOT send to system Contact Us
    console.log('Landing Page Lead:', formData)
    setSubmitted(true)
    // Optional: Reset form after some time or keep success message
  }

  const {
    title,
    description,
    email,
    phone,
    logo, // URL
    cover, // URL
    media = [], // Array of URLs
    facebook,
    instagram,
    twitter,
    linkedin,
    url
  } = data

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-2">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          {/* Left: Email */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {email && (
              <>
                <FaEnvelope className="text-blue-600" />
                <a href={`mailto:${email}`} className="hover:text-blue-600 transition-colors">{email}</a>
              </>
            )}
          </div>
          
          {/* Right: Social Icons */}
          <div className="flex items-center gap-4">
            {facebook && <a href={facebook} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors"><FaFacebook size={16} /></a>}
            {instagram && <a href={instagram} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors"><FaInstagram size={16} /></a>}
            {twitter && <a href={twitter} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors"><FaTwitter size={16} /></a>}
            {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors"><FaLinkedin size={16} /></a>}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900 text-white">
        {cover ? (
          <img src={cover} alt="Cover" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 opacity-90" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          {logo && (
            <img src={logo} alt="Logo" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mb-6 object-cover bg-white" />
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">{title || 'Your Landing Page Title'}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-16">
        <div className="prose lg:prose-xl text-gray-600 text-center mx-auto w-full max-w-4xl break-words whitespace-pre-wrap">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Us</h2>
          <p className="whitespace-pre-wrap break-words">{description || 'Detailed description goes here...'}</p>
        </div>
        
        {/* Contact Form Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto w-full" id="contact">
          <h3 className="text-2xl font-bold mb-6 text-center">CONTACT US</h3>
            
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <FaCheckCircle size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-600">Your inquiry has been received. We will contact you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all resize-none"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  Submit 
                </button>
              </form>
            )}

            {/* Direct Contact Info (Secondary) */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="space-y-3">
                {phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaPhone className="text-blue-600" />
                    <span>{phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaEnvelope className="text-blue-600" />
                    <span>{email}</span>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      {media.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {media.map((src, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <img src={src} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <p>© {new Date().getFullYear()} {title || 'Brand Name'}. All rights reserved.</p>
      </footer>
    </div>
  )
}
