import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BedDouble, ConciergeBell, Info, Phone, LucideProps } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define a proper type for the navigation items
interface NavItem {
  label: string;
  to: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  state?: { tab: string };
}

// Items shown in the USER bottom navbar
const userNavItems: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Accomodation', to: '/rooms', icon: BedDouble },
  { label: 'Services', to: '/services', icon: ConciergeBell },
  { label: 'About Us', to: '/about', icon: Info },
  { label: 'Contact Us', to: '/contact', icon: Phone },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';
  // const navItems = isAdmin ? adminNavItems : userNavItems;
  const navItems = userNavItems;

  // For admin, highlight based on search params or path
  let adminTab = '';
  if (isAdmin && location.pathname === '/admin') {
    // Try to get tab from search params
    const params = new URLSearchParams(location.search);
    adminTab = params.get('tab') || '';
  }

  return (
    <nav className="fixed bottom-[-1px] left-0 right-[-1px] z-50 bg-[#3f4a40] border-t border-[#232325] flex justify-between px-2 py-1 md:hidden">
      {navItems.map(({ label, to, icon: Icon, state }) => {
        let active = location.pathname === to;
        if (isAdmin && location.pathname === '/admin') {
          if (state && state.tab && adminTab === state.tab) {
            active = true;
          } else if (!state && adminTab === '') {
            // Home tab
            active = true;
          } else {
            active = false;
          }
        }
        return (
          <Link
            key={label}
            to={state && state.tab ? `${to}?tab=${state.tab}` : to}
            className={`flex flex-col items-center flex-1 py-1 px-1 text-xs ${active ? 'text-white' : 'text-[#b0b0b0]'} transition-colors`}
          >
            <Icon className={`w-6 h-6 mb-0.5 ${active ? 'text-white' : 'text-[#b0b0b0]'}`} />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;