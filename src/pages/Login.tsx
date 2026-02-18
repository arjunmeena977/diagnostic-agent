import { useState } from 'react';

interface LoginProps {
    onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.endsWith('@intucate.com')) {
            setError('Email must be from @intucate.com domain');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        // Mock successful login
        setError('');
        onLogin();
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <input
                        type="email"
                        placeholder="Email (e.g., admin@intucate.com)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password (8+ chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: 0 }}>{error}</p>}
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}
