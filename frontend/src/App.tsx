import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { NoticeDetail } from './pages/NoticeDetail';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NoticeForm } from './pages/NoticeForm';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col selection:bg-brand-500/30">
            <Navbar />
            <main className="flex-grow pb-16">
              <Routes>
                {/* Student Public Interfaces */}
                <Route path="/" element={<Home />} />
                <Route path="/notice/:id" element={<NoticeDetail />} />
                
                {/* Admin Gateways */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/create" element={<NoticeForm />} />
                <Route path="/admin/edit/:id" element={<NoticeForm />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
