import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DeductionForm from './components/admin/DeductionForm';
import PayslipForm from './components/admin/PayslipForm';
import Payslip from './components/admin/Payslip';
import PayslipDisplay from './components/admin/PayslipDisplay';
import DisplayAllDeductions from './components/admin/DeductionDisplay';
import Company from "./components/admin/Company/CompanyForm"
import DisplayCompany from './components/admin/Company/Displaycompany';
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<PayslipForm />} path='/payslipform' />
          <Route element={<PayslipDisplay />} path='/payslipdisplay' />
          <Route element={<Company />} path='/companyform' />
          <Route element={<DisplayCompany />} path='/DisplayCompany' />
          <Route element={<DisplayAllDeductions />} path='/deductiondisplay' />
          <Route element={<DeductionForm />} path='/deductionform/:empid/:payid' />
          <Route element={<Payslip />} path='/payslip/:payslipid' />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
