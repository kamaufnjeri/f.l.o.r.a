import Layout from "./components/shared/Layout";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecordJournal from "./pages/RecordJournal";
import RecordSales from "./pages/RecordSales";
import RecordPurchase from "./pages/RecordPurchase";
import PurchaseBill from "./pages/PurchaseBill";
import SalesInvoice from "./pages/SalesInvoice";
import JournalBill from "./pages/JournalBill";
import JournalInvoice from "./pages/JournalInvoice";
import Accounts from "./pages/Accounts";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Journals from "./pages/Journals";
import SinglePurchase from "./pages/SinglePurchase";
import SingleJournal from "./pages/SingleJournal";
import SingleSale from "./pages/SingleSale";
import Invoices from "./pages/Invoices";
import Bills from "./pages/Bills";
import PurchaseReturns from "./pages/PurchaseReturns";
import SalesReturns from "./pages/SalesReturns";
import Payments from "./pages/Payments";
import SingleBillPayments from "./pages/SingleBillPayments";
import SingleInvoicePayments from "./pages/SingleInvoicePayments";
import SinglePurchaseReturns from "./pages/SinglePurchaseReturns";
import SingleSalesReturns from "./pages/SingleSalesReturns";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import AcceptInvite from "./pages/AcceptInvite";
import OrganisationCreatePage from "./pages/OrganisationCreatePage";


const RegisterRoute = () => {
  localStorage.clear()
  return <Register />
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/Register' element={<RegisterRoute />} />
          <Route path='/login' element={<Login />} />
          <Route path='/confirm-email/:uidb64/:token' element={<VerifyEmail />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:uidb64/:token' element={<ResetPassword />} />
          <Route path='/accept-invite/:uidb64' element={<AcceptInvite />} />
          <Route path='/' element={<Layout />}>
            <Route path='/organisation-create' element={<OrganisationCreatePage />} />
          </Route>

          <Route path='/dashboard/:orgId' element={<Layout />}>
            <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='stocks' element={<ProtectedRoute><Stocks /></ProtectedRoute>} />
            <Route path='bills' element={<ProtectedRoute><Bills /></ProtectedRoute>} />
            <Route path='bills/:id/payments' element={<ProtectedRoute><SingleBillPayments /></ProtectedRoute>} />
            <Route path='payments' element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path='invoices' element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path='invoices/:id/payments' element={<ProtectedRoute><SingleInvoicePayments /></ProtectedRoute>} />
            <Route path='accounts' element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path='suppliers' element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path='customers' element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path='purchases' element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
            <Route path='purchases/:id' element={<ProtectedRoute><SinglePurchase /></ProtectedRoute>} />
            <Route path='purchases/:id/purchase_returns' element={<ProtectedRoute><SinglePurchaseReturns /></ProtectedRoute>} />
            <Route path='purchase_returns' element={<ProtectedRoute><PurchaseReturns /></ProtectedRoute>} />
            <Route path='purchases/record' element={<ProtectedRoute><RecordPurchase /></ProtectedRoute>} />
            <Route path='purchases/bill' element={<ProtectedRoute><PurchaseBill /></ProtectedRoute>} />
            <Route path='sales' element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path='sales/:id' element={<ProtectedRoute><SingleSale /></ProtectedRoute>} />
            <Route path='sales/:id/sales_returns' element={<ProtectedRoute><SingleSalesReturns /></ProtectedRoute>} />
            <Route path='sales/record' element={<ProtectedRoute><RecordSales /></ProtectedRoute>} />
            <Route path='sales/invoice' element={<ProtectedRoute><SalesInvoice /></ProtectedRoute>} />
            <Route path='sales_returns' element={<ProtectedRoute><SalesReturns /></ProtectedRoute>} />
            <Route path='journals' element={<ProtectedRoute><Journals /></ProtectedRoute>} />
            <Route path='journals/:id' element={<ProtectedRoute><SingleJournal /></ProtectedRoute>} />
            <Route path='journals/record' element={<ProtectedRoute><RecordJournal /></ProtectedRoute>} />
            <Route path='journals/bill' element={<ProtectedRoute><JournalBill /></ProtectedRoute>} />
            <Route path='journals/invoice' element={<ProtectedRoute><JournalInvoice /></ProtectedRoute>} />
           
          </Route>
        </Routes>
      </AuthProvider>
    </Router>

  );
};

export default App;
