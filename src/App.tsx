import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/pages/HomePage';
import TrackingPage from './components/pages/TrackingPage';
import HistoryPage from './components/pages/HistoryPage';
import PaymentPage from './components/pages/PaymentPage';
import { useEffect } from 'react';
import { useOrderStore } from './stores/useOrderStore';
import { useCartStore } from './stores/useCartStore';
import { useThemeStore } from './stores/useThemeStore';

export default function App() {
  const loadHistory = useOrderStore((s) => s.loadHistory);
  const loadCart = useCartStore((s) => s.loadCart);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    loadCart();
    loadHistory();
  }, [loadCart, loadHistory]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
