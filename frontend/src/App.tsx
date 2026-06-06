import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { NoticeDetail } from './pages/NoticeDetail';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NoticeForm } from './pages/NoticeForm';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col selection:bg-brand-500/30">
            <Navbar />
            <main className="flex-grow pb-16">
              <Routes>
                {/* Student Protected Interfaces */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/notice/:id" element={<ProtectedRoute><NoticeDetail /></ProtectedRoute>} />
                
                {/* Admin Gateways */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/create" element={<ProtectedRoute><NoticeForm /></ProtectedRoute>} />
                <Route path="/admin/edit/:id" element={<ProtectedRoute><NoticeForm /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
