import express from 'express';
import cors from "cors";
import mongoConnect from './Config/mongoConnect.js';
import citizenAuthRoute from './Routes/Auth/citizenAuthRoutes.js';
import { verifyToken } from './Middlewares/auth.middleware.js';
import citizenRoute from './Routes/CitizenR/citizenRoutes.js';
import staffAuthRoutes from './Routes/Auth/staffAuthRoutes.js';
import getUserRoute from './Routes/Others/getUser.js';
import otpRoute from './Routes/Others/otpRoutes.js';
import adminRoute from './Routes/Admin/adminRoute.js';
import complaintRoute from './Routes/Complaint/complaintRoutes.js';
import notificationRoute from './Routes/Notification/notificationRoutes.js';


const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

mongoConnect();
app.use(express.json());
app.use(verifyToken);
app.use(getUserRoute);

// Routes
app.use("/otp", otpRoute);

// auth
app.use("/auth/citizen", citizenAuthRoute);
app.use("/auth/staff", staffAuthRoutes);

// citizen
app.use("/citizen", citizenRoute);

// admin
app.use("/admin", adminRoute);

// complaints
app.use("/complaints", complaintRoute);

// notifications
app.use("/notifications", notificationRoute);

app.listen(port, () => { 
  console.log(`Server listening on port ${port}`);
});
