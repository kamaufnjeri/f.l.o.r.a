import Layout from "./components/shared/Layout";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecordJournal from "./pages/RecordJournal";
import RecordSales from "./pages/RecordSales";
import RecordPurchase from "./pages/RecordPurchase";

const App = () => {
  

  return (
    <Router>
      <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Dashboard/>}></Route>
        <Route path='stocks' element={<Stock/>}></Route>
        <Route path='purchases'></Route>
        <Route path='purchases/record' element={<RecordPurchase/>}></Route>
        <Route path='sales'></Route>
        <Route path='sales/record' element={<RecordSales/>}></Route>
        <Route path='journals'></Route>
        <Route path='journals/record' element={<RecordJournal/>}></Route>
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
