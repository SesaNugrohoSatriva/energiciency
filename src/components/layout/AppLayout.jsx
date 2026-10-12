import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const location = useLocation();
  const isRoot = location.pathname === '/';

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div className={!isRoot ? 'content-offset' : ''}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
