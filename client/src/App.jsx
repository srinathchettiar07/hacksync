import { Routes, Route, Navigate } from "react-router";



import CitizenSignup from "./Component/Auth/CitizenSignup";
import CitizenLogin from "./Component/Auth/CitizenLogin";
import StaffLogin from "./Component/Auth/StaffLogin";
import LandingPage from "./Component/LandingPage";
import CitizenLayout from "./Component/Citizen/CitizenLayout";
import FileAComplaint from "./Component/Citizen/FileAComplaint";
import CitizenDashboard from "./Component/Citizen/CitizenDashBoard";
import ComplaintDetail from "./Component/Citizen/ComplaintDetails";
import Posts from "./Component/Citizen/Posts";
import CitizenChat from "./Component/Citizen/chatroom";

import AdminLayout from "./Component/Staff/Admin/AdminLayout";
import AdminDashboard from "./Component/Staff/Admin/AdminDashBoard";
import Map from "./Component/Staff/Admin/Map";
import AddDepartment from "./Component/Staff/Admin/AddDepartment";
import DepartmentManagement from "./Component/Staff/Admin/viewDepartments";


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
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard/>}/>
          <Route path="map" element={<Map/>}/>
          <Route path="add-department" element={<AddDepartment/>}/>
          <Route path="department" element={<DepartmentManagement/>}/>
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
