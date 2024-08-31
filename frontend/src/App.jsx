import Layout from "./components/shared/Layout";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecordJournal from "./pages/RecordJournal";
import RecordSales from "./pages/RecordSales";
import RecordPurchase from "./pages/RecordPurchase";
import PurchaseBill from "./pages/PurchaseBill";
import SalesInvoice from "./pages/SalesInvoice";
import JournalBill from "./pages/JournalBill";
import JournalInvoice from "./pages/JournalInvoice";

const App = () => {
  

  return (
    <Router>
      <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Dashboard/>}></Route>
        <Route path='stocks' element={<Stock/>}></Route>
        <Route path='purchases'></Route>
        <Route path='purchases/record' element={<RecordPurchase/>}></Route>
        <Route path='purchases/bill' element={<PurchaseBill/>}></Route>
        <Route path='sales'></Route>
        <Route path='sales/record' element={<RecordSales/>}></Route>
        <Route path='sales/invoice' element={<SalesInvoice/>}/>
        <Route path='journals'></Route>
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
