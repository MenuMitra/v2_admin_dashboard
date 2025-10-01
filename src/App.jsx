import React, { useEffect } from "react";
import EnquiryList from "./components/Enquiry/EnquiryList";
import BookingEnquiry from "./components/Booking/BookingEnquiry";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Outlets from "./components/Outlets";
import CreateOutlet from "./components/CreateOutlet";
import ViewOutlet from "./components/ViewOutlet";
import EditOutlet from "./components/EditOutlet";
import Owners from "./components/Owners";
import OwnerDetails from "./components/OwnerDetails";
import EditOwner from "./components/EditOwner";
import CreateOwner from "./components/CreateOwner";
import Partners from "./components/Partner/Partners";
import PartnerDetails from "./components/Partner/PartnerDetails";
import EditPartner from "./components/Partner/EditPartner";
import CreatePartner from "./components/Partner/CreatePartner";
import Roles from "./components/AccessControl/Roles/Roles";
import ViewEnquiry from "./components/Enquiry/ViewEnquiry";
import Search from "./components/Search/Search";
import Customer from "./components/Customer/Customer";
import CustomerDetails from "./components/Customer/CustomerDetails";
import SuperOwner from "./components/SuperOwner/SuperOwner";
import CreateSuperOwner from "./components/SuperOwner/CreateSuperOwner";
import SuperOwnerDetails from "./components/SuperOwner/SuperOwnerDetails";
import EditSuperOwner from "./components/SuperOwner/EditSuperOwner";
import CreateAdmin from "./components/Admin/CreateAdmin";
import Admins from "./components/Admin/Admins";
import AdminDetails from "./components/Admin/AdminDetails";
import EditAdmin from "./components/Admin/EditAdmin";
import ManageCategories from "./components/Outlets/Category/ManageCategories";
import ManageMenus from "./components/Outlets/Menu/ManageMenus";
import CategoryDetails from "./components/Outlets/Category/CategoryDetails";
import EditCategory from "./components/Outlets/Category/EditCategory";
import MenuDetails from "./components/Outlets/Menu/MenuDetails";
import EditMenu from "./components/Outlets/Menu/EditMenu";
import CreateCategory from "./components/Outlets/Category/CreateCategory";
import CreateMenu from "./components/Outlets/Menu/CreateMenu";
import { ToastProvider } from "./components/common/ToastProvider";
import RoleDetails from "./components/AccessControl/Roles/RoleDetails";
import UBACTree from "./components/UBAC/UBACTree";

import EditCustomer from "./components/Customer/EditCustomer";

import Staff from "./components/AccessControl/Roles/Staff/Staff";
import CreateStaff from "./components/AccessControl/Roles/Staff/CreateStaff";
import StaffDetails from "./components/AccessControl/Roles/Staff/StaffDetails";
import EditStaff from "./components/AccessControl/Roles/Staff/EditStaff";

import Subscriptions from "./components/Subscriptions/Subscriptions";
import CreateSubscription from "./components/Subscriptions/CreateSubscription";
import EditSubscription from "./components/Subscriptions/EditSubscription";
import ViewSubscription from "./components/Subscriptions/ViewSubscription";
import Notifications from "./components/Notifications/Notifications";
import CreateNotification from "./components/Notifications/CreateNotification";
import Stats from "./components/Stats/Stats";
import DBTablesStats from "./components/Stats/DBTablesStats";
import CombinedStats from "./components/Stats/CombinedStats";
import "remixicon/fonts/remixicon.css";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Auth />} />

          {/* Protected routes with AppLayout */}
          <Route element={<PrivateRoute />}>
            {/* Dashboard Routes */}
            <Route path="/home" element={<Dashboard />} />

            {/* Profile Routes */}
            <Route path="/profile" element={<Profile />} />

            {/* Outlet Routes */}
            <Route path="/outlets" element={<Outlets />} />
            <Route path="/create-outlet" element={<CreateOutlet />} />
            <Route path="/view-outlet/:outletId" element={<ViewOutlet />} />
            <Route path="/edit-outlet/:outletId" element={<EditOutlet />} />
            <Route
              path="/categories/:outletId"
              element={<ManageCategories />}
            />
            <Route
              path="/category-details/:outletId/:menuCategoryId"
              element={<CategoryDetails />}
            />
            <Route
              path="/create-category/:outletId/"
              element={<CreateCategory />}
            />
            <Route
              path="/edit-category/:outletId/:menuCategoryId"
              element={<EditCategory />}
            />
            <Route path="/menus/:outletId" element={<ManageMenus />} />
            <Route
              path="/menu-details/:outletId/:menuId"
              element={<MenuDetails />}
            />
            <Route path="/create-menu/:outletId" element={<CreateMenu />} />
            <Route path="/edit-menu/:outletId/:menuId" element={<EditMenu />} />

            {/* Owner Routes */}
            <Route path="/owners" element={<Owners />} />
            <Route path="/owner-details/:ownerId" element={<OwnerDetails />} />
            <Route path="/edit-owner/:ownerId" element={<EditOwner />} />
            <Route path="/create-owner" element={<CreateOwner />} />

            {/* Enquiry Routes */}
            <Route path="/enquiries" element={<EnquiryList />} />
            <Route path="/view-enquiry/:enquiry_id" element={<ViewEnquiry />} />
            {/* Booking Routes */}
            <Route path="/bookings" element={<BookingEnquiry />} />

            {/* Partner Routes */}
            <Route path="/partners" element={<Partners />} />
            <Route
              path="/partner-details/:partnerId"
              element={<PartnerDetails />}
            />
            <Route path="/edit-partner/:partnerId" element={<EditPartner />} />
            <Route path="/create-partner" element={<CreatePartner />} />

            {/* Roles Routes */}
            <Route path="/roles" element={<Roles />} />
            <Route path="/role-details/:userId" element={<RoleDetails />} />

            {/* Subscriptions Routes */}
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route
              path="/create-subscription"
              element={<CreateSubscription />}
            />
            <Route
              path="/edit-subscription/:subscriptionId"
              element={<EditSubscription />}
            />
            <Route
              path="/view-subscription/:subscriptionId"
              element={<ViewSubscription />}
            />

            {/* Notifications Routes */}
            <Route path="/notifications" element={<Notifications />} />
            <Route
              path="/create-notification"
              element={<CreateNotification />}
            />

            {/* Staff Routes */}
            <Route path="/staff/:outletId" element={<Staff />} />
            <Route path="/create-staff/:outletId" element={<CreateStaff />} />
            <Route
              path="/staff-details/:outletId/:userId"
              element={<StaffDetails />}
            />
            <Route
              path="/edit-staff/:outletId/:userId"
              element={<EditStaff />}
            />
            {/* End legacy role routes */}

            {/* Search Routes */}
            <Route path="/search" element={<Search />} />

            {/* Customer Routes */}

            <Route path="/customer" element={<Customer />} />
            <Route
              path="/customer-details/:customerId"
              element={<CustomerDetails />}
            />
            <Route
              path="/edit-customer/:customerId"
              element={<EditCustomer />}
            />

            {/* Super Owner Routes */}
            <Route path="/super-owners" element={<SuperOwner />} />
            <Route path="/create-super-owner" element={<CreateSuperOwner />} />
            <Route
              path="/super-owner-details/:superOwnerId"
              element={<SuperOwnerDetails />}
            />
            <Route
              path="/edit-super-owner/:superOwnerId"
              element={<EditSuperOwner />}
            />

            {/* Admin Routes */}
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/admin-details/:adminId" element={<AdminDetails />} />
            <Route path="/edit-admin/:adminId" element={<EditAdmin />} />

            {/* Stats Routes */}
            <Route path="/stats" element={<Stats />} />
            <Route path="/ubac_tree" element={<UBACTree />} />
            <Route path="/db-tables-stats" element={<DBTablesStats />} />
            <Route path="/combined-stats" element={<CombinedStats />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
