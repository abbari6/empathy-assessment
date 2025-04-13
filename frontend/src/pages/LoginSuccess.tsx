import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const LoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        localStorage.setItem('instagram_token', token);
        navigate('/profile' );
      } catch (err) {
        console.error('Error parsing:', err);
        navigate('/login-error');
      }
    } else {
      navigate('');
    }
  }, [location, navigate]);

  return <div className="p-4 text-center">Processing login...</div>;
};