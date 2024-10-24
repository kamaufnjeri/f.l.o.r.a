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
  return <Register/>
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/Register' element={<RegisterRoute/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/confirm-email/:uidb64/:token' element={<VerifyEmail/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password/:uidb64/:token' element={<ResetPassword/>}/>
        <Route path='/accept-invite/:uidb64' element={<AcceptInvite/>}/>
        <Route path='/' element={<Layout/>}>
        <Route path='/organisation-create' element={<OrganisationCreatePage/>}/>
        </Route>
       
      <Route path='/dashboard/:orgId' element={<Layout/>}>
        <Route index element={<ProtectedRoute><Dashboard/></ProtectedRoute>}></Route>
        <Route path='stocks' element={<Stocks/>}></Route>
        <Route path='bills' element={<Bills/>}></Route>
        <Route path='bills/:id/payments' element={<SingleBillPayments/>}></Route>
        <Route path='payments' element={<Payments/>}></Route>
        <Route path='invoices' element={<Invoices/>}></Route>
        <Route path='invoices/:id/payments' element={<SingleInvoicePayments/>}></Route>
        <Route path='accounts' element={<Accounts/>}></Route>
        <Route path='suppliers' element={<Suppliers/>}></Route>
        <Route path='customers' element={<Customers/>}></Route>
        <Route path='purchases' element={<Purchases/>}></Route>
        <Route path='purchases/:id' element={<SinglePurchase/>}></Route>
        <Route path='purchases/:id/purchase_returns' element={<SinglePurchaseReturns/>}></Route>
        <Route path='purchase_returns' element={<PurchaseReturns/>}></Route>
        <Route path='purchases/record' element={<RecordPurchase/>}></Route>
        <Route path='purchases/bill' element={<PurchaseBill/>}></Route>
        <Route path='sales' element={<Sales/>}></Route>
        <Route path='sales/:id' element={<SingleSale/>}></Route>
        <Route path='sales/:id/sales_returns' element={<SingleSalesReturns/>}></Route>
        <Route path='sales/record' element={<RecordSales/>}></Route>
        <Route path='sales/invoice' element={<SalesInvoice/>}/>
        <Route path='sales_returns' element={<SalesReturns/>}/>
        <Route path='journals' element={<Journals/>}></Route>
        <Route path='journals/:id' element={<SingleJournal/>}></Route>
        <Route path='journals/record' element={<RecordJournal/>}></Route>
        <Route path='journals/bill' element={<JournalBill/>}/>
        <Route path='journals/invoice' element={<JournalInvoice/>}/>
        <Route path='ledgers'></Route>
        <Route path='customers'></Route>
        <Route path='suppliers'></Route>
        <Route path='reports'></Route>
      </Route>
    </Routes>
    </AuthProvider>
    </Router>
    
  );
};

export default App;
