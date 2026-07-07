import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import MailApp from './pages/MailApp';
import { AuthProvider } from '@/lib/useAuth';

function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/app" element={<MailApp />} />
                </Routes>
                <Toaster richColors position="top-center" />
            </Router>
        </AuthProvider>
    );
}

export default App;
