import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TicketPage } from './pages/TicketPage';
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<TicketPage />} />
        <Route path="/testcases" element={<div className="p-8 text-center text-gray-500">Test Cases - Coming in Phase 2</div>} />
        <Route path="/workflow" element={<div className="p-8 text-center text-gray-500">Workflow - Coming in Phase 3</div>} />
        <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings - Coming in Phase 4</div>} />
      </Route>
    </Routes>
  );
}

export default App;