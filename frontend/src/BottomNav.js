import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/categories' || path === '/liked' || path === '/profile') {
      return location.pathname.startsWith(path);
    }
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/home',
      label: 'Home',
      icon: 'M3 12L12 3l9 9M4 10v10h16V10'
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'
    },
    {
      path: '/liked',
      label: 'Liked',
      icon: 'M12 21C12 21 4 13.36 4 8.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0120 8.5C20 13.36 12 21 12 21z'
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: 'M12 8a4 4 0 100-8 4 4 0 000 8zM6 20c0-3.314 2.686-6 6-6s6 2.686 6 6'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#FF9933] shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-between items-center py-2 px-6">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center transition-colors ${
              isActive(item.path) ? 'text-[#FF9933]' : 'text-[#964B00]'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d={item.icon} />
            </svg>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavbar;