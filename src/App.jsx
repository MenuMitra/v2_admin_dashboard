import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Outlets from './components/Outlets';
import CreateOutlet from './components/CreateOutlet';
import ViewOutlet from './components/ViewOutlet';
import EditOutlet from './components/EditOutlet';
import Owners from './components/Owners';
import OwnerDetails from './components/OwnerDetails';
import EditOwner from './components/EditOwner';
import CreateOwner from './components/CreateOwner';
import Partners from './components/Partner/Partners';
import PartnerDetails from './components/Partner/PartnerDetails';
import EditPartner from './components/Partner/EditPartner';
import CreatePartner from './components/Partner/CreatePartner';
import Functionalities from './components/AccessControl/Functionalities/Functionalities';
import Roles from './components/AccessControl/Roles/Roles';
import QRTemplates from './components/QRTemplate/QRTemplates';
import CreateTemplate from './components/QRTemplate/CreateTemplate';
import TemplateDetails from './components/QRTemplate/TemplateDetails';
import EditTemplate from './components/QRTemplate/EditTemplate';
import Tickets from './components/Ticket/Tickets';
import TicketDetails from './components/Ticket/TicketDetails';
import Search from './components/Search/Search';
import Customer from './components/Customer/Customer';
import CustomerDetails from './components/Customer/CustomerDetails';
import SuperOwner from './components/SuperOwner/SuperOwner';
import CreateSuperOwner from './components/SuperOwner/CreateSuperOwner';
import SuperOwnerDetails from './components/SuperOwner/SuperOwnerDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Auth />} />
        
        {/* Protected routes with AppLayout */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/outlets" element={<Outlets />} />
          <Route path="/create-outlet" element={<CreateOutlet />} />
          <Route path="/view-outlet/:outletId" element={<ViewOutlet />} />
          <Route path="/edit-outlet/:outletId" element={<EditOutlet />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/owner-details/:ownerId" element={<OwnerDetails />} />
          <Route path="/edit-owner/:ownerId" element={<EditOwner />} />
          <Route path="/create-owner" element={<CreateOwner />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partner-details/:partnerId" element={<PartnerDetails />} />
          <Route path="/edit-partner/:partnerId" element={<EditPartner />} />
          <Route path="/create-partner" element={<CreatePartner />} />
          <Route path="/functionalities" element={<Functionalities />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/qr-templates" element={<QRTemplates />} />
          <Route path="/create-template" element={<CreateTemplate />} />
          <Route path="/template-details/:templateId" element={<TemplateDetails />} />
          <Route path="/edit-template/:templateId" element={<EditTemplate />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/ticket-details/:ticketId" element={<TicketDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/customer-details/:customerId" element={<CustomerDetails />} />
          <Route path="/super-owners" element={<SuperOwner />} />
          <Route path="/create-super-owner" element={<CreateSuperOwner />} />
          <Route path="/super-owner-details/:superOwnerId" element={<SuperOwnerDetails />} />
          {/* Add other protected routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
