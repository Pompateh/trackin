import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import logo from '../../assets/Vector.png';

const Header = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Always navigate to login first, then sign out
      navigate('/login');
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.warn('Sign out error (non-critical):', error);
      // Don't show error toast since we're already navigating away
    }
  };

  return (
    <header className="bg-white-300 py-4 w-full">
      <div className="navbar w-full flex justify-between items-center">
        <div className="flex-1">
          <Link to="/" className="p-0">
            <img src={logo} alt="Logo" className="h-14 w-auto" />
          </Link>
        </div>
        <div className="flex-none flex justify-end">
          {user ? (
            <button onClick={handleSignOut} className="text-black font-crimson font-semibold" style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}>
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="text-black bg-white border border-black font-crimson font-semibold" style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 