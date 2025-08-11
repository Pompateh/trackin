import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const getPasswordStrength = (password) => {
    if (password.length < 6) return 'Too short';
    return 'Good';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (!validateEmail(email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (isSignUp) {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          return;
        }
        const strength = getPasswordStrength(password);
        if (strength !== 'Good') {
          setErrorMsg(`Password: ${strength}`);
          return;
        }
        await signUp(email, password);
        toast.success('Check your email for the confirmation link!');
        setShowResend(true);
        setIsSignUp(false); // Switch back to login view
      } else {
        await signIn(email, password);
        toast.success('Signed in successfully!');
        navigate('/');
      }
    } catch (error) {
      if (error.message.includes('User already registered')) {
        setErrorMsg('Email is already registered. Please log in.');
      } else if (error.message.includes('weak password')) {
        setErrorMsg('Password is too weak.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordStrength(getPasswordStrength(e.target.value));
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await signUp(email, password); // Supabase will resend confirmation
      if (error) throw error;
      toast.success('Confirmation email resent!');
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm border border-black bg-white">
                <form onSubmit={handleSubmit} aria-label={isSignUp ? 'Sign Up Form' : 'Login Form'}>
          <div className="p-2">
                      {/* Logo and Title */}
            <div className="text-left relative mb-16">
              <img src="/src/assets/Vector.png" alt="Logo" className="h-26 w-auto" />
                            <p className="text-black uppercase tracking-wide absolute left-0" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 200, fontSize: '35px', top: '72px' }}>TRACKING APP</p>
            </div>
           
           {errorMsg && (
             <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-sm" role="alert">
               {errorMsg}
             </div>
           )}
           
                      <div className="mb-4">
              <label className="block text-black" htmlFor="email-input" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}>
                Gmail
              </label>
                           <input
                id="email-input"
                type="email"
                placeholder=""
                className="w-full px-3 py-2 border border-black text-black text-lg"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-required="true"
                aria-invalid={!!errorMsg && !validateEmail(email)}
              />
           </div>
           
                      <div className="mb-4">
              <label className="block text-black" htmlFor="password-input" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}>
                Password
              </label>
                         <input
               id="password-input"
               type="password"
               placeholder=""
               className="w-full px-3 py-2 border border-black text-black text-lg"
               required
               value={password}
               onChange={handlePasswordChange}
               aria-required="true"
               aria-describedby="password-strength"
             />
            {isSignUp && (
              <div id="password-strength" className={`text-xs mt-1 ${passwordStrength === 'Good' ? 'text-green-600' : 'text-red-600'}`}>
                {password && `Password: ${passwordStrength}`}
              </div>
            )}
          </div>
          
                     {isSignUp && (
             <div className="mb-4">
               <label className="block text-black mb-2" htmlFor="confirm-password-input" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}>
                 Confirm Password
               </label>
                             <input
                 id="confirm-password-input"
                 type="password"
                 placeholder=""
                 className="w-full px-3 py-2 border border-black text-black text-lg"
                 required
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 aria-required="true"
               />
            </div>
          )}
          </div>
          
                          {/* Buttons outside padding but still inside form */}
          <div className={`border-t border-black ${isSignUp ? 'border-b border-black' : ''}`}>
            {!isSignUp ? (
              // Login mode: Show both buttons side by side
              <div className="flex">
                <button 
                  type="button" 
                  className="flex-1 py-3 bg-white text-black border-r border-black hover:bg-gray-50"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignUp(true);
                    setErrorMsg('');
                    setConfirmPassword('');
                    setPasswordStrength('');
                  }}
                >
                  Sign Up
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-white text-black hover:bg-gray-50"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? <span className="loading loading-spinner"></span> : 'Login'}
                </button>
              </div>
            ) : (
              // Signup mode: Show only Sign Up button taking full width
              <div className="w-full">
                <button 
                  type="submit" 
                  className="w-full py-3 bg-white text-black hover:bg-gray-50"
                  style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? <span className="loading loading-spinner"></span> : 'Sign Up'}
                </button>
              </div>
            )}
          </div>
         </form>
        
        {showResend && (
          <div className="text-center mt-4 p-4">
            <button 
              type="button" 
              className="text-blue-600 hover:text-blue-800 underline text-sm" 
              onClick={handleResend} 
              disabled={isSubmitting}
            >
              Resend confirmation email
            </button>
          </div>
        )}
        
                 {/* Back button when in sign up mode */}
         {isSignUp && (
           <div className="text-center py-3">
             <button
               type="button"
               className="text-black-600 "
               style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 600, fontSize: '18px' }}
               onClick={(e) => {
                 e.preventDefault();
                 setIsSignUp(false);
                 setErrorMsg('');
                 setConfirmPassword('');
                 setPasswordStrength('');
               }}
             >
               ← Back to Login
             </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default Login; 