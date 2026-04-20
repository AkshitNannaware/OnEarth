import React from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, MessageCircle, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button } from './ui/button';

import { useEffect, useState } from 'react';

const Footer = ({ isAdmin = false }) => {
  const [branding, setBranding] = useState({
    address: '',
    phone: '',
    email: '',
    facebook: 'https://www.facebook.com/profile.php?id=61574319958891',
    instagram: 'https://www.instagram.com/onearth_hotel',
    youtube: 'https://youtube.com/yourchannel',
  });
  useEffect(() => {
    fetch('http://localhost:5000/api/branding')
      .then(res => res.json())
      .then(data => setBranding(prev => ({ ...prev, ...data })))
      .catch(() => { });
  }, []);
  return (
    <footer className="relative overflow-hidden bg-[#3a4a3e] text-[#efece6]">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(180deg, rgba(7,12,9,0.7) 0%, rgba(7,12,9,0.2) 35%, rgba(7,12,9,0.6) 100%), radial-gradient(circle at 15% 80%, rgba(90,110,90,0.35), transparent 55%), radial-gradient(circle at 85% 15%, rgba(90,110,90,0.25), transparent 50%)' }} />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:220px_100%]" />
      <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
        {!isAdmin ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* On Earth Section */}
              <div>
                <h2 className="text-3xl sm:text-3xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]" style={{ fontFamily: "'Great Vibes', cursive" }}>
                  On Earth
                </h2>
                <nav className="space-y-2">
                  {[
                    { label: 'Rooms', to: '/rooms' },
                    { label: 'Services', to: '/services' },
                    { label: 'About', to: '/about' },
                    { label: 'Contact', to: '/contact' },
                    { label: 'Blog', to: '/blog' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block text-sm text-[#c9c3b6] hover:text-[#efece6] transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Quick Links Section */}
              <div>
                <h3 className="text-lg sm:text-xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm text-[#c9c3b6]">
                  <li>
                    <Link to="/profile?tab=bookings" className="hover:text-[#efece6] transition-colors duration-200">
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/offers" className="hover:text-[#efece6] transition-colors duration-200">
                      Special Offers
                    </Link>
                  </li>
                  <li className="text-[#c9c3b6]">51 Rooms & 26 Suites</li>
                </ul>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-lg sm:text-xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]">
                  Contact
                </h3>
                <ul className="space-y-3 text-sm text-[#c9c3b6]">
                  {branding.address && (
                    <li className="flex items-start gap-2">
                      <span className="text-[#d7d0bf] mt-0.5">📍</span>
                      <span>{branding.address}</span>
                    </li>
                  )}
                  {branding.phone && (
                    <li className="flex items-center gap-2">
                      <span className="text-[#d7d0bf]">📞</span>
                      <span>{branding.phone}</span>
                    </li>
                  )}
                  {branding.email && (
                    <li className="flex items-center gap-2">
                      <span className="text-[#d7d0bf]">✉️</span>
                      <span>{branding.email}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Connect Section */}
              <div>
                <h3 className="text-lg sm:text-xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]">
                  Connect
                </h3>
                <div className="flex gap-3 mb-4 flex-wrap">
                  <a
                    href={branding.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={branding.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={branding.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pl-0 md:pl-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Admin Panel Section */}
              <div>
                <h2 className="text-xl sm:text-2xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]" style={{ fontFamily: "'Great Vibes', cursive" }}>
                  Admin Panel
                </h2>
                <nav className="space-y-2">
                  {[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Manage Bookings', to: '/admin/bookings' },
                    { label: 'Manage Rooms', to: '/admin/rooms' },
                    { label: 'Manage Services', to: '/admin/services' },
                    { label: 'Manage Offers', to: '/admin/offers' },
                    { label: 'Manage Newsletters', to: '/admin/newsletters' },
                    { label: 'Manage Contacts', to: '/admin/contacts' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block text-sm text-[#c9c3b6] hover:text-[#efece6] transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Quick Admin Links Section */}
              <div>
                <h3 className="text-lg sm:text-xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]">
                  Quick Admin Links
                </h3>
                <ul className="space-y-2 text-sm text-[#c9c3b6]">
                  <li>
                    <Link to="/admin/bookings" className="hover:text-[#efece6] transition-colors duration-200">
                      All Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/service-bookings" className="hover:text-[#efece6] transition-colors duration-200">
                      Service Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/offers" className="hover:text-[#efece6] transition-colors duration-200">
                      All Offers
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" state={{ tab: 'settings' }} className="hover:text-[#efece6] transition-colors duration-200">
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/" className="hover:text-[#efece6] transition-colors duration-200">
                      Back to Website
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Hotel Info Section */}
              <div>
                <h3 className="text-lg sm:text-xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]">
                  Hotel Info
                </h3>
                <ul className="space-y-3 text-sm text-[#c9c3b6]">
                  {branding.address && (
                    <li className="flex items-start gap-2">
                      <span className="text-[#d7d0bf] mt-0.5">📍</span>
                      <span>{branding.address}</span>
                    </li>
                  )}
                  {branding.phone && (
                    <li className="flex items-center gap-2">
                      <span className="text-[#d7d0bf]">📞</span>
                      <span>{branding.phone}</span>
                    </li>
                  )}
                  {branding.email && (
                    <li className="flex items-center gap-2">
                      <span className="text-[#d7d0bf]">✉️</span>
                      <span>{branding.email}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Admin Connect Section */}
              <div>
                <h3 className="text-lg sm:text-xl mb-5 text-[#efece6] font-serif tracking-wide pb-3 border-b border-[#5b6255]">
                  Admin Connect
                </h3>
                <div className="flex gap-3 mb-4 flex-wrap">
                  <a
                    href={branding.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href={branding.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href={branding.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Copyright */}
        <div className={`mt-8 mb-10 pl-[-20px] pt-5 ${isAdmin ? 'border-t border-[#5b6255]' : 'border-t border-[#6c7564]'} justify-between items-center flex-col md:flex-row flex gap-6 md:gap-0`}>
          <p className={`text-sm sm:text-base ${isAdmin ? 'text-[#c9c3b6]' : 'text-[#a9a492]'}`}>© {new Date().getFullYear()} Developed By. Alphanexis Technologies PVT.Ltd.</p>
          <div className="flex gap-3 pr-32">
            <a
              href="https://www.linkedin.com/company/alphanexis/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/people/AlphaNexis/61562936054548/?rdid=vrnyFSNe5naB2gz7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1My4zij8wm%2F"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
              title="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://wa.me/8817617752"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-[#6c7564] flex items-center justify-center hover:border-[#d7d0bf] hover:bg-[#5b6255] text-[#c9c3b6] hover:text-[#efece6] transition-all duration-200"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
