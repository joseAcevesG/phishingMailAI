import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const Authenticate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const authenticateUser = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                console.error('No token provided');
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`/api/authenticate?token=${token}`);
                if (response.ok) {
                    // If authentication is successful, redirect to home
                    navigate('/');
                } else {
                    // If authentication fails, redirect to login
                    console.error('Authentication failed');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                navigate('/login');
            }
        };

        authenticateUser();
    }, [navigate, searchParams]);

    return (
        <div className="authenticate-container">
            <p>Authenticating...</p>
        </div>
    );
};
