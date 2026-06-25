import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell/AppShell';
import Dashboard from './pages/Dashboard/Dashboard';
import Members from './pages/Members/Members';
import MemberDetail from './pages/Members/MemberDetail';
import Claims from './pages/Claims/Claims';
import Care from './pages/Care/Care';
import Providers from './pages/Providers/Providers';
import Settings from './pages/Settings/Settings';
import Billing from './pages/Billing/Billing';
import GenerateInvoice from './pages/Billing/GenerateInvoice';
import ApprovalQueue from './pages/Billing/ApprovalQueue';
import InvoiceApprovalDetail from './pages/Billing/InvoiceApprovalDetail';
import SurgeryCostShare from './pages/Client/SurgeryCostShare/SurgeryCostShare';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="claims" element={<Claims />} />
          <Route path="care" element={<Care />} />
          <Route path="providers" element={<Providers />} />
          <Route path="billing" element={<Billing />} />
          <Route path="billing/generate" element={<GenerateInvoice />} />
          <Route path="billing/approvals" element={<ApprovalQueue />} />
          <Route path="billing/approvals/:id" element={<InvoiceApprovalDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="client/cost-share/surgery" element={<SurgeryCostShare />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
