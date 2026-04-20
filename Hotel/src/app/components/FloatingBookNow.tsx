import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type FloatingBookNowProps = {
  to?: string;
  label?: string;
};

const FloatingBookNow = ({ to = '/rooms', label = 'Book Now' }: FloatingBookNowProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/admin-signup';
  if (isAdminRoute) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(user ? to : '/login')}
      className="fixed right-4 bottom-24 lg:bottom-8 z-[70] flex items-center gap-2 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold tracking-wide text-white shadow-xl shadow-black/30 ring-1 ring-white/20 transition hover:bg-amber-500 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      aria-label={label}
    >
      <CalendarDays className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};

export default FloatingBookNow;
