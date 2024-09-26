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

const App = () => {
  

  return (
    <Router>
      <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Dashboard/>}></Route>
        <Route path='stocks' element={<Stocks/>}></Route>
        <Route path='accounts' element={<Accounts/>}></Route>
        <Route path='suppliers' element={<Suppliers/>}></Route>
        <Route path='customers' element={<Customers/>}></Route>
        <Route path='purchases' element={<Purchases/>}></Route>
        <Route path='purchases/record' element={<RecordPurchase/>}></Route>
        <Route path='purchases/bill' element={<PurchaseBill/>}></Route>
        <Route path='sales' element={<Sales/>}></Route>
        <Route path='sales/record' element={<RecordSales/>}></Route>
        <Route path='sales/invoice' element={<SalesInvoice/>}/>
        <Route path='journals' element={<Journals/>}></Route>
        <Route path='journals/record' element={<RecordJournal/>}></Route>
        <Route path='journals/bill' element={<JournalBill/>}/>
        <Route path='journals/invoice' element={<JournalInvoice/>}/>
        <Route path='ledgers'></Route>
        <Route path='customers'></Route>
        <Route path='suppliers'></Route>
        <Route path='reports'></Route>
      </Route>
    </Routes>
    </Router>
    
  );
};

export default App;
