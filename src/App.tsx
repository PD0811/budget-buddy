import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./AuthPage";
import SignUpPage from "./SignUpPage";
import Dashboard from "./Dashboard";
import Expenses from "./Expenses";
import Products from "./Products";
import Reports from "./Reports";
import ReportPrediction from "./ReportPrediction";
import ReportMonthly from "./ReportMonthly";
import ReportCalendar from "./ReportCalendar";
import ReportExport from "./ReportExport";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/product" element={<Products />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/prediction" element={<ReportPrediction />} />
        <Route path="/reports/monthly" element={<ReportMonthly />} />
        <Route path="/reports/calendar" element={<ReportCalendar />} />
        <Route path="/reports/export" element={<ReportExport />} />
      </Routes>
    </Router>
  );
}

export default App;
