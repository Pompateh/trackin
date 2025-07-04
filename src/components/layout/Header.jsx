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
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="bg-white-300 py-4 w-full">
      <div className="navbar w-full flex justify-between items-center">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost normal-case p-0">
            <img src={logo} alt="Logo" className="h-14 w-auto" />
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