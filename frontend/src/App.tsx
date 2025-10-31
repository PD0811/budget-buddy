import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./AuthPage";
import SignUpPage from "./SignUpPage";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import AddExpense from "./AddExpense";
import ManageExpenses from "./ManageExpenses";
import AddProduct from "./AddProduct";
import AddProductType from "./AddProductType";
import AddVendor from "./AddVendor";
import Reports from "./Reports";
import ReportPrediction from "./ReportPrediction";
import ReportMonthly from "./ReportMonthly";
import Analytics from "./Analytics";
import ReportCalendar from "./ReportCalendar";
import ReportExport from "./ReportExport";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/expenses"
            element={<Navigate to="/expenses/add" replace />}
          />
          <Route path="/expenses/add" element={<AddExpense />} />
          <Route path="/expenses/manage" element={<ManageExpenses />} />
          <Route path="/product/add" element={<AddProduct />} />
          <Route path="/product/add-type" element={<AddProductType />} />
          <Route path="/product/add-vendor" element={<AddVendor />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/prediction" element={<ReportPrediction />} />
          <Route path="/reports/monthly" element={<ReportMonthly />} />
          <Route path="/reports/analytics" element={<Analytics />} />
          <Route path="/reports/calendar" element={<ReportCalendar />} />
          <Route path="/reports/export" element={<ReportExport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
