import mongoose from "mongoose";

const citizenSchema = new mongoose.Schema({ 
    displayName: { type: String, required: true },
    password:{type:String,required:true},
    address: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    aadhaar: { type: String, unique: true },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    profilePicture: { type: String, default: "https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg" }, // URL
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    DepartmentHead: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null }
}, { timestamps: true });

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password:{type:String,required:true},
    phone: { type: String },
    profilePicture: { type: String, default: "" }, // URL
    role: { type: String, enum: ["Admin", "DepartmentHead", "Worker"], required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    isFree:{ type: Boolean, default: true },
    status: { 
        type: String, 
        enum: ["Available", "Busy", "Offline"], 
        default: "Available" 
    },
    currentWorkload: { type: Number, default: 0 },
    maxWorkload: { type: Number, default: 5 }
}, { timestamps: true });



const reportMetadataSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    budget: {
      type: String,
      required: true,
      trim: true
    },

    construction_details: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    timeline: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    contractor: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    status: {
      type: String,
      required: true,
    },

    gps_coordinates: {
      type: String,
      trim: true
      // Example: "19.4550, 72.8111"
    },

    additional_info: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);



const complaintSchema = new mongoose.Schema({
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
    category: {
        type: String,
        enum: ["Pothole", "Streetlight", "Garbage", "Water", "Other"],
        required: true
    },
    description: { type: String },
    locationLat: { type: Number ,default:null},
    locationLong: { type: Number ,default:null},
    address: { type: String },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved"],
        default: "Pending"
    },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    assignedDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
}, { timestamps: true });

const complaintImageSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });


const complaintCommentSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const complaintUpvoteSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });


const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otpCode: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset", "login"],
      default: "email_verification",
    },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }, // auto-expiry
  },
  { timestamps: true }
);


const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: 'public-room',
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Staff'
  },
  type: {
    type: String,
    enum: ['complaint_assigned', 'complaint_resolved', 'urgent_complaint', 'system_update'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});



// Prevent duplicate upvotes by the same citizen
complaintUpvoteSchema.index({ complaintId: 1, citizenId: 1 }, { unique: true });

// Export models
const OTP =mongoose.model("OTP", otpSchema);
const Citizen = mongoose.model("Citizen", citizenSchema);
const Department = mongoose.model("Department", departmentSchema);
const Staff = mongoose.model("Staff", staffSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);
const ComplaintImage = mongoose.model("ComplaintImage", complaintImageSchema);

const ComplaintComment = mongoose.model("ComplaintComment", complaintCommentSchema);
const ComplaintUpvote = mongoose.model("ComplaintUpvote", complaintUpvoteSchema);
const Contract =  mongoose.model("ReportMetadata", reportMetadataSchema);

// Index for better performance
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
const Notification = mongoose.model('Notification', notificationSchema);

export { };

export {
    Citizen,
    Department,
    Staff,
    Complaint,
    ComplaintImage,
    ComplaintComment,
    ComplaintUpvote,
    OTP,
    Message,
    Notification,
    Contract
};

