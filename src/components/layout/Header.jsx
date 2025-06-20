import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="bg-base-100 shadow-md">
      <div className="container mx-auto navbar">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            DoodleNote
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            {user ? (
              <li>
                <button onClick={handleSignOut} className="btn btn-ghost">
                  Sign Out
                </button>
              </li>
            ) : (
              <li>
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header; 