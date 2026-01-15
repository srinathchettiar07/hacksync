import { Routes, Route, Navigate } from "react-router";
import CitizenSignup from "./Component/Auth/CitizenSignup";
import CitizenLogin from "./Component/Auth/CitizenLogin";
import StaffLogin from "./Component/Auth/StaffLogin";
import LandingPage from "./Component/LandingPage";
import CitizenLayout from "./Component/Citizen/CitizenLayout";
import FileAComplaint from "./Component/Citizen/FileAComplaint";
import CitizenDashboard from "./Component/Citizen/CitizenDashBoard";
import ComplaintDetail from "./Component/Citizen/ComplaintDetails";
import ReportIssue from "./Component/Citizen/thescanner";
import Posts from "./Component/Citizen/Posts";
import CitizenChat from "./Component/Citizen/chatroom";
import DocumentAnalysis from "./Component/Citizen/DocumentAnalysis";
import Addreports from "./Component/Staff/Admin/addreports";
import AdminLayout from "./Component/Staff/Admin/AdminLayout";
import AdminDashboard from "./Component/Staff/Admin/AdminDashBoard";
import Map from "./Component/Staff/Admin/Map";
import AddDepartment from "./Component/Staff/Admin/AddDepartment";
import DepartmentManagement from "./Component/Staff/Admin/viewDepartments";
import ComplaintDashboard from "./Component/Staff/Admin/ComplaintDashboard";
import DepartmentDashboard from "./Component/Staff/Admin/DepartmentDashboard";
import WorkerManagement from "./Component/Staff/Admin/WorkerManagement";
import Complain from "./Component/Staff/Admin/Complain";

import ViewReports from "./Component/Staff/Admin/ViewReports";


function App() {
  return (
    <>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />


        {/* For Auth */}
        {/* Citizen Routes */}
        <Route path="/citizen/signup" element={<CitizenSignup />} />
        <Route path="/citizen/login" element={<CitizenLogin />} />


        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />






        {/* for Citzen */}
        <Route path="/citizen/portal" element={<CitizenLayout />}>
          <Route path="dashboard" element={<CitizenDashboard/>} />
          <Route path="file-a-complain" element={<FileAComplaint/>} />
          <Route path="posts" element={<Posts/>} />
          <Route path=":complaintId" element={<ComplaintDetail/>} />
          <Route path="chat" element={<CitizenChat />} />
          <Route path="document-analysis" element={<DocumentAnalysis />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard/>}/>
          <Route path="complaints" element={<ComplaintDashboard/>}/>
          <Route path="department-dashboard" element={<DepartmentDashboard/>}/>
          <Route path="workers" element={<WorkerManagement/>}/>
          <Route path="map" element={<Map/>}/>
          <Route path="add-department" element={<AddDepartment/>}/>
          <Route path="department" element={<DepartmentManagement/>}/>
          <Route path="complaint/:complaintId" element={<Complain/>}/>
          <Route path="reports" element={<Addreports/>}/>
          <Route path="view-reports" element={<ViewReports />} />
        </Route>


      







        {/* Default: redirect to citizen login */}
        <Route path="*" element={<Navigate to="/citizen/login" />} />
        
      </Routes>
    </>
  );
}

export default App;



// import VoiceComplaint from "./Component/VoiceComplaint";
// function App() {
//   return (
//     <div className="">
//       <VoiceComplaint />
//     </div>
//   );
// }

// export default App;
