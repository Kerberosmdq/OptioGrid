import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { TemplateView } from './components/TemplateView';
import { Landing } from './components/Landing';
import type { Session } from '@supabase/supabase-js';
import { Toaster } from 'sonner';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <Router>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/template/:id"
          element={session ? <TemplateView /> : <Navigate to="/auth" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
