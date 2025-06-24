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
    <div className="hero min-h-fit bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">{isSignUp ? 'Sign Up' : 'Login'} now!</h1>
          <p className="py-6">
            Access your collaborative projects. Manage tasks, use the canvas, and stay in sync with your team.
          </p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleSubmit} aria-label={isSignUp ? 'Sign Up Form' : 'Login Form'}>
            {errorMsg && (
              <div className="alert alert-error mb-2" role="alert">
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="form-control">
              <label className="label" htmlFor="email-input">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="email"
                className="input input-bordered"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-required="true"
                aria-invalid={!!errorMsg && !validateEmail(email)}
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="password-input">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password-input"
                type="password"
                placeholder="password"
                className="input input-bordered"
                required
                value={password}
                onChange={handlePasswordChange}
                aria-required="true"
                aria-describedby="password-strength"
              />
              {isSignUp && (
                <div id="password-strength" className={`text-xs mt-1 ${passwordStrength === 'Good' ? 'text-green-600' : 'text-red-600'}`}>{password && `Password: ${passwordStrength}`}</div>
              )}
            </div>
            {isSignUp && (
              <div className="form-control">
                <label className="label" htmlFor="confirm-password-input">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  id="confirm-password-input"
                  type="password"
                  placeholder="confirm password"
                  className="input input-bordered"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-required="true"
                />
              </div>
            )}
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner"></span> : isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </div>
            {showResend && (
              <div className="text-center mt-2">
                <button type="button" className="btn btn-link" onClick={handleResend} disabled={isSubmitting}>
                  Resend confirmation email
                </button>
              </div>
            )}
            <div className="text-center mt-4">
              <a
                href="#"
                className="link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setConfirmPassword('');
                  setPasswordStrength('');
                }}
                aria-label={isSignUp ? 'Switch to Login' : 'Switch to Sign Up'}
              >
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 