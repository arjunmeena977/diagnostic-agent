import { useState } from 'react';
import Login from '@/pages/Login';
import AdminConsole from '@/pages/AdminConsole';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <>
          <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Intucate AI Test
          </h1>
          <Login onLogin={() => setIsAuthenticated(true)} />
        </>
      ) : (
        <AdminConsole />
      )}
    </div>
  );
}

export default App;
