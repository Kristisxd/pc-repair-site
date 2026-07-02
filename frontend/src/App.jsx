import { Routes, Route, Navigate } from 'react-router-dom';
import MarketingSite from './pages/MarketingSite.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingSite />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
