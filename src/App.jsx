import React, { useEffect } from 'react';
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
import EditSuperOwner from './components/SuperOwner/EditSuperOwner';
import AddRoleAssignFunctionalities from './components/AccessControl/Roles/AddRoleAssignFunctionalities';
import AssignFunctionlaityRole from './components/AccessControl/Functionalities/AssignFunctionlaityRole';
import CreateAdmin from './components/Admin/CreateAdmin';
import Admins from './components/Admin/Admins';
import AdminDetails from './components/Admin/AdminDetails';
import EditAdmin from './components/Admin/EditAdmin';
import ManageCategories from './components/Outlets/Category/ManageCategories';
import ManageMenus from './components/Outlets/Menu/ManageMenus';
import CategoryDetails from './components/Outlets/Category/CategoryDetails';
import EditCategory from './components/Outlets/Category/EditCategory';
import MenuDetails from './components/Outlets/Menu/MenuDetails';
import EditMenu from './components/Outlets/Menu/EditMenu';
import CreateCategory from './components/Outlets/Category/CreateCategory';
import CreateMenu from './components/Outlets/Menu/CreateMenu';
import { ToastProvider } from './components/common/ToastProvider';
import RoleDetails from './components/AccessControl/Roles/RoleDetails';


function App() {
  useEffect(() => {
    // Check for initial dark mode preference when app loads
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode && JSON.parse(savedDarkMode)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark', 'bg-gray-900');
    }
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Auth />} />
          
          {/* Protected routes with AppLayout */}
          <Route element={<PrivateRoute />}>

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Profile Routes */}
            <Route path="/profile" element={<Profile />} />

            {/* Outlet Routes */}
            <Route path="/outlets" element={<Outlets />} />
            <Route path="/create-outlet" element={<CreateOutlet />} />
            <Route path="/view-outlet/:outletId" element={<ViewOutlet />} />
            <Route path="/edit-outlet/:outletId" element={<EditOutlet />} />
            <Route path="/categories/:outletId" element={<ManageCategories />} />
            <Route path="/category-details/:outletId/:menuCategoryId" element={<CategoryDetails />} />
            <Route path="/create-category/:outletId/" element={<CreateCategory />} />
            <Route path="/edit-category/:outletId/:menuCategoryId" element={<EditCategory />} />
            <Route path="/menus/:outletId" element={<ManageMenus />} />
            <Route path="/menu-details/:outletId/:menuId" element={<MenuDetails />} />
            <Route path="/create-menu/:outletId" element={<CreateMenu />} />
            <Route path="/edit-menu/:outletId/:menuId" element={<EditMenu />} />

            {/* Owner Routes */}
            <Route path="/owners" element={<Owners />} />
            <Route path="/owner-details/:ownerId" element={<OwnerDetails />} />
            <Route path="/edit-owner/:ownerId" element={<EditOwner />} />
            <Route path="/create-owner" element={<CreateOwner />} />

            {/* Partner Routes */}
            <Route path="/partners" element={<Partners />} />
            <Route path="/partner-details/:partnerId" element={<PartnerDetails />} />
            <Route path="/edit-partner/:partnerId" element={<EditPartner />} />
            <Route path="/create-partner" element={<CreatePartner />} />

            {/* Functionalities Routes */}
            <Route path="/functionalities" element={<Functionalities />} />
            <Route path="/add-role-assign-functionalities/:roleId" element={<AddRoleAssignFunctionalities />} />
            <Route path="/assign-functionality-role/:functionalityId" element={<AssignFunctionlaityRole />} />

            {/* Roles Routes */}
            <Route path="/roles" element={<Roles />} />
            <Route path="/role-details/:userId" element={<RoleDetails />} />

            {/* QR Templates Routes */}
            <Route path="/qr-templates" element={<QRTemplates />} />
            <Route path="/create-template" element={<CreateTemplate />} />
            <Route path="/template-details/:templateId" element={<TemplateDetails />} />
            <Route path="/edit-template/:templateId" element={<EditTemplate />} />

            {/* Tickets Routes */}
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/ticket-details/:ticketId" element={<TicketDetails />} />

            {/* Search Routes */}
            <Route path="/search" element={<Search />} />

            {/* Customer Routes */}

            <Route path="/customer" element={<Customer />} />
            <Route path="/customer-details/:customerId" element={<CustomerDetails />} />

            {/* Super Owner Routes */}
            <Route path="/super-owners" element={<SuperOwner />} />
            <Route path="/create-super-owner" element={<CreateSuperOwner />} />
            <Route path="/super-owner-details/:superOwnerId" element={<SuperOwnerDetails />} />
            <Route path="/edit-super-owner/:superOwnerId" element={<EditSuperOwner />} />
            

            {/* Admin Routes */}
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/admin-details/:adminId" element={<AdminDetails />} />
            <Route path="/edit-admin/:adminId" element={<EditAdmin />} />
            
            {/* Add other protected routes here */}
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
