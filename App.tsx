import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { Wizard } from './screens/Wizard';
import { useAppStore } from './store';

function App() {
  const setUser = useAppStore(state => state.setUser);

  useEffect(() => {
    const { data: { subscription } } = require('./lib/supabaseClient').supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wizard" element={<Wizard />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
