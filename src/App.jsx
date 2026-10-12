import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ProductionOrdersPage from './pages/ProductionOrdersPage';
import EnergyMonitoringPage from './pages/EnergyMonitoringPage';
import MachinePerformancePage from './pages/MachinePerformancePage';
import ProductPage from './pages/ProductPage';
import CostingPage from './pages/CostingPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import { buildMockData } from './data/mockDatabase';

function loadPersistedData() {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('energiciency-data') : null;
  if (!stored) {
    return buildMockData();
  }

  try {
    const parsed = JSON.parse(stored);
    if (parsed && parsed.products && parsed.orders) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse persisted Energiciency data', error);
  }

  return buildMockData();
}

export default function App() {
  const [data, setData] = useState(() => loadPersistedData());

  useEffect(() => {
    window.localStorage.setItem('energiciency-data', JSON.stringify(data));
  }, [data]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage data={data} />} />
        <Route path="/production-orders" element={<ProductionOrdersPage data={data} setData={setData} />} />
        <Route path="/products/:productId?" element={<ProductPage data={data} setData={setData} />} />
        <Route path="/energy-monitoring" element={<EnergyMonitoringPage data={data} />} />
        <Route path="/machine-performance" element={<MachinePerformancePage data={data} />} />
        <Route path="/machines/:machineId?" element={<MachinePerformancePage data={data} />} />
        <Route path="/costing" element={<CostingPage data={data} />} />
        <Route path="/inventory" element={<InventoryPage data={data} />} />
        <Route path="/quality-control" element={<Navigate to="/machine-performance" replace />} />
        <Route path="/reports" element={<ReportsPage data={data} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
