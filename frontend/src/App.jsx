import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { SelectOptionsProvider } from "./context/SelectOptionsContext";

// Shared Pages
import Home from "./pages/shared/Home";

// User Authentication Pages
import Register from "./pages/users/Register";
import Login from "./pages/users/Login";
import VerifyEmail from "./pages/users/VerifyEmail";
import ForgotPassword from "./pages/users/ForgotPassword";
import ResetPassword from "./pages/users/ResetPassword";

// Organisation Pages
import AcceptInvite from "./pages/organisations/AcceptInvite";
import OrganisationCreatePage from "./pages/organisations/OrganisationCreatePage";
import Dashboard from "./pages/organisations/Dashboard";

// Accounts Pages
import Accounts from "./pages/accounts/Accounts";
import SingleAccount from "./pages/accounts/SingleAccount";

// Bills Pages
import Bills from "./pages/bills/Bills";

// Customers Pages
import Customers from "./pages/customers/Customers";
import SingleCustomer from "./pages/customers/SingleCustomer";

import Invoices from "./pages/invoices/Invoices";

// Journals Pages

import Journals from "./pages/journals/Journals";
import SingleJournal from "./pages/journals/SingleJournal";
import RecordJournal from "./pages/journals/RecordJournal";

// Payments Pages
import Payments from "./pages/payments/Payments";
import SingleBillPayments from "./pages/payments/SingleBillPayments";
import SingleInvoicePayments from "./pages/payments/SingleInvoicePayments";

// Purchases Pages
import Purchases from "./pages/purchases/Purchases";
import RecordPurchase from "./pages/purchases/RecordPurchase";
import SinglePurchase from "./pages/purchases/SinglePurchase";
import PurchaseReturns from "./pages/purchases/PurchaseReturns";
import SinglePurchaseReturns from "./pages/purchases/SinglePurchaseReturns";

// Sales Pages
import Sales from "./pages/sales/Sales";
import SingleSale from "./pages/sales/SingleSale";
import RecordSales from "./pages/sales/RecordSales";
import SalesReturns from "./pages/sales/SalesReturns";
import SingleSalesReturns from "./pages/sales/SingleSalesReturns";
import UpdateSales from "./pages/sales/UpdateSales";


// Stocks Pages
import Stocks from "./pages/stocks/Stocks";
import SingleStock from "./pages/stocks/SingleStock";

// Services Pages
import Services from "./pages/services/Services";
import SingleService from "./pages/services/SingleService";

// Service Income Pages
import RecordServiceIncome from "./pages/serviceIncome/RecordServiceIncome";
import ServiceIncome from "./pages/serviceIncome/ServiceIncome";
import SingleServiceIncome from "./pages/serviceIncome/SingleServiceIncome";
import UpdateServiceIncome from "./pages/serviceIncome/UpdateServiceIncome";

// Suppliers Pages
import Suppliers from "./pages/suppliers/Suppliers";
import SingleSupplier from "./pages/suppliers/SingleSupplier";
import UpdateSingleJournal from "./pages/journals/UpdateSingleJournal";
import UpdatePurchase from "./pages/purchases/UpdatePurchase";

const RegisterRoute = () => {
  localStorage.clear();
  return <Register />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SelectOptionsProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/confirm-email/:uidb64/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
            <Route path="/accept-invite/:uidb64" element={<AcceptInvite />} />
            <Route path="/" element={<Layout />}>
              <Route
                path="/organisation-create"
                element={
                  <ProtectedRoute>
                    <OrganisationCreatePage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/dashboard/:orgId" element={<Layout />}>
              <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="stocks" element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
              <Route path="stocks/:id" element={<ProtectedRoute><SingleStock /></ProtectedRoute>} />
              <Route path="services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="services/:id" element={<ProtectedRoute><SingleService /></ProtectedRoute>} />
              
              <Route path="bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
              <Route path="bills/:id/payments" element={<ProtectedRoute><SingleBillPayments /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              <Route path="invoices/:id/payments" element={<ProtectedRoute><SingleInvoicePayments /></ProtectedRoute>} />
              <Route path="accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
              <Route path="accounts/:id" element={<ProtectedRoute><SingleAccount /></ProtectedRoute>} />
              <Route path="suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
              <Route path="suppliers/:id" element={<ProtectedRoute><SingleSupplier /></ProtectedRoute>} />
              <Route path="customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="customers/:id" element={<ProtectedRoute><SingleCustomer /></ProtectedRoute>} />
              <Route path="purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="purchases/:id" element={<ProtectedRoute><SinglePurchase /></ProtectedRoute>} />
              <Route path="purchases/:id/edit" element={<ProtectedRoute><UpdatePurchase /></ProtectedRoute>} />
              <Route path="purchases/:id/purchase_returns" element={<ProtectedRoute><SinglePurchaseReturns /></ProtectedRoute>} />
              <Route path="purchase_returns" element={<ProtectedRoute><PurchaseReturns /></ProtectedRoute>} />
              <Route path="purchases/record" element={<ProtectedRoute><RecordPurchase /></ProtectedRoute>} />
              <Route path="sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
              <Route path="sales/:id" element={<ProtectedRoute><SingleSale /></ProtectedRoute>} />
              <Route path="sales/:id/edit" element={<ProtectedRoute><UpdateSales /></ProtectedRoute>} />
              <Route path="sales/:id/sales_returns" element={<ProtectedRoute><SingleSalesReturns /></ProtectedRoute>} />
              <Route path="sales/record" element={<ProtectedRoute><RecordSales /></ProtectedRoute>} />
              <Route path="sales_returns" element={<ProtectedRoute><SalesReturns /></ProtectedRoute>} />
              <Route path="service_income/record" element={<ProtectedRoute><RecordServiceIncome /></ProtectedRoute>} />
              <Route path="service_income" element={<ProtectedRoute><ServiceIncome /></ProtectedRoute>} />
              <Route path="service_income/:id" element={<ProtectedRoute><SingleServiceIncome /></ProtectedRoute>} />
              <Route path="service_income/:id/edit" element={<ProtectedRoute><UpdateServiceIncome /></ProtectedRoute>} />
              <Route path="journals" element={<ProtectedRoute><Journals /></ProtectedRoute>} />
              <Route path="journals/:id" element={<ProtectedRoute><SingleJournal /></ProtectedRoute>} />
              <Route path="journals/:id/edit" element={<ProtectedRoute><UpdateSingleJournal /></ProtectedRoute>} />
              <Route path="journals/record" element={<ProtectedRoute><RecordJournal /></ProtectedRoute>} />
              
            </Route>
          </Routes>
        </SelectOptionsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
