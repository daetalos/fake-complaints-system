import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const Home = React.lazy(() => import('./pages/Home'));
const NewComplaintPage = React.lazy(() => import('./pages/NewComplaintPage'));

function App() {

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error('API health check failed');
        }
        const data = await response.json();
        console.log('API Health Check:', data);
      } catch (error) {
        console.error('API Health Check Error:', error);
      }
    };

    checkApiHealth();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/complaints/new" element={<NewComplaintPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
