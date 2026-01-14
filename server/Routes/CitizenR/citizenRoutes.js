import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import FormData from "form-data";
import { Complaint, ComplaintImage, ComplaintComment, ComplaintUpvote } from "../../models/models.js";

const citizenRoute = express.Router();

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: "dnbm8mudh",
  api_key: "798531331584739",
  api_secret: "9AccGAO8XeRYX9uRPE5567FJu94",
});

// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });



// ✅ Complaint route
citizenRoute.post(
  "/send-complain",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { description, locationLat, locationLong, address } = req.body;
      const citizenId = req.user;

      // Determine category using AI model based on first image (if provided)
      let resolvedCategory = "Other";
      const categoryMap = {
        pothole: "Pothole",
        streetlight: "Streetlight",
        garbage: "Garbage",
        waterlogging: "Water",
        other: "Other",
      };

      if (req.files && req.files.length > 0) {
        const firstImage = req.files[0];
        const base64Image = firstImage.buffer.toString("base64");
        const dataURI = `data:${firstImage.mimetype};base64,${base64Image}`;

        // Send to FastAPI classifier
        try {
          const form = new FormData();
          form.append(
            "file",
            Buffer.from(firstImage.buffer),
            {
              filename: firstImage.originalname || "upload.jpg",
              contentType: firstImage.mimetype,
              knownLength: firstImage.size,
            }
          );

          const aiResponse = await axios.post(
            process.env.AI_CLASSIFIER_URL || "http://127.0.0.1:8000/classify",
            form,
            { headers: form.getHeaders() }
          );

          const predicted = aiResponse?.data?.predicted_category;
          const mapped = categoryMap[String(predicted || "").toLowerCase()] || "Other";
          resolvedCategory = mapped;
        } catch (aiErr) {
          console.error("AI classification failed, defaulting to Other:", aiErr?.response?.data || aiErr?.message);
          resolvedCategory = "Other";
        }
      }

      const complaint = new Complaint({
        citizenId,
        category: resolvedCategory,
        description,
        locationLat,
        locationLong,
        address,
      });

      await complaint.save();

      // Upload images to Cloudinary
      const uploadedImages = [];
      for (const file of req.files) {
        const b64 = file.buffer.toString("base64");
        const dataURI = "data:" + file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "complaints",
        });

        uploadedImages.push({
          complaintId: complaint._id,
          imageUrl: result.secure_url,
        });
      }

      if (uploadedImages.length > 0) {
        await ComplaintImage.insertMany(uploadedImages);
      }

      res.status(201).json({
        message: "Complaint submitted successfully",
        complaint,
        images: uploadedImages,
        aiCategory: resolvedCategory,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        message: "Failed to submit complaint",
        error: error.message,
      });
    }
  }
);

citizenRoute.get("/get-dashboard-info", async (req, res) => {
  try {
    const citizenId = req.user;
    if (!citizenId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const complaints = await Complaint.find({ citizenId })
      .select("description category status createdAt")
      .sort({ createdAt: -1 });

    const complaintIds = complaints.map((c) => c._id);

    const images = await ComplaintImage.aggregate([
      { $match: { complaintId: { $in: complaintIds } } },
      {
        $group: {
          _id: "$complaintId",
          imageUrl: { $first: "$imageUrl" },
        },
      },
    ]);

    const complaintsWithImage = complaints.map((complaint) => {
      const img = images.find(
        (i) => i._id.toString() === complaint._id.toString()
      );
      return {
        complainId: complaint._id,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        createdAt: complaint.createdAt,
        image: img ? img.imageUrl : null,
      };
    });

    const statuses = ["Pending", "In Progress", "Resolved"];
    const statusCounts = {};
    for (const status of statuses) {
      statusCounts[status] = await Complaint.countDocuments({ citizenId, status });
    }

    const totalComplaints = complaints.length;

    res.status(200).json({
      message: "Dashboard info fetched successfully",
      complaints: complaintsWithImage,
      analytics: {
        totalComplaints,
        ...statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard info:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard info",
      error: error.message,
    });
  }
});




















citizenRoute.post("/complaint/:id/upvote", async (req, res) => {
  try {
    const citizenId = req.user;
    const complaintId = req.params.id;

    if (!citizenId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if upvote exists
    const existingUpvote = await ComplaintUpvote.findOne({ complaintId, citizenId });

    if (existingUpvote) {
      // Remove upvote
      await ComplaintUpvote.deleteOne({ _id: existingUpvote._id });

      // Get updated upvote count
      const upvoteCount = await ComplaintUpvote.countDocuments({ complaintId });

      return res.status(200).json({
        message: "Upvote removed",
        upvoted: false,
        count: upvoteCount
      });
    } else {
      // Add new upvote
      await ComplaintUpvote.create({ complaintId, citizenId });

      // Get updated upvote count
      const upvoteCount = await ComplaintUpvote.countDocuments({ complaintId });

      return res.status(201).json({
        message: "Complaint upvoted successfully",
        upvoted: true,
        count: upvoteCount
      });
    }
  } catch (error) {
    console.error("Error toggling upvote:", error);
    res.status(500).json({ message: "Failed to toggle upvote" });
  }
});







//saish
citizenRoute.post("/complaint/:id/comment", async (req, res) => {
  try {
    const citizenId = req.user;
    const complaintId = req.params.id;
    const { comment } = req.body;

    if (!citizenId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const newComment = await ComplaintComment.create({
      complaintId,
      citizenId,
      comment,
    });

    // Populate user info for response
    await newComment.populate("citizenId", "displayName");

    // Format comment for response
    const formattedComment = {
      id: newComment._id,
      user: newComment.citizenId.displayName,
      text: newComment.comment,
      timestamp: newComment.createdAt,
    };

    // Get updated comment count
    const commentCount = await ComplaintComment.countDocuments({ complaintId });

    res.status(201).json({
      message: "Comment added successfully",
      comment: formattedComment,
      commentCount: commentCount,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});












citizenRoute.get("/complaint/:id", async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user; // ✅ from verifyToken middleware

    // Find complaint
    const complaint = await Complaint.findById(complaintId)
      .populate("citizenId", "displayName profilePicture")
      .select("description category address locationLat locationLong createdAt status");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ Fetch all images for this complaint
    const images = await ComplaintImage.find({ complaintId }).select("_id imageUrl");

    // ✅ Fetch all comments with user info
    const comments = await ComplaintComment.find({ complaintId })
      .populate("citizenId", "displayName -_id")
      .sort({ createdAt: -1 })
      .select("comment createdAt")
      .lean();

    const formattedComments = comments.map(c => ({
      id: c._id,
      user: c.citizenId.displayName,
      text: c.comment,
      timestamp: c.createdAt
    }));

    // ✅ Count upvotes & check if user already upvoted
    const upvotes = await ComplaintUpvote.countDocuments({ complaintId });
    const alreadyUpvoted = await ComplaintUpvote.exists({ complaintId, citizenId: userId });

    // ---------- Analysis (for this complaint only) ----------
    const totalImages = images.length;
    const totalComments = comments.length;
    const totalUpvotes = upvotes;

    const createdAt = new Date(complaint.createdAt);
    const now = new Date();
    const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    let engagementLevel = "Low";
    if (totalComments + totalUpvotes > 15) {
      engagementLevel = "High";
    } else if (totalComments + totalUpvotes > 5) {
      engagementLevel = "Medium";
    }

    const analysis = {
      totalImages,
      totalComments,
      totalUpvotes,
      ageInDays,
      engagementLevel
    };
    // ------------------------------------------------------

    res.status(200).json({
      complaint: {
        id: complaint._id,
        description: complaint.description,
        category: complaint.category,
        address: complaint.address,
        locationLat: complaint.locationLat,
        locationLong: complaint.locationLong,
        createdAt: complaint.createdAt,
        status: complaint.status,
        user: {
          name: complaint.citizenId.displayName,
          avatar: complaint.citizenId.profilePicture
        }
      },
      images, // full array with _id + imageUrl
      comments: formattedComments,
      upvotes,
      alreadyUpvoted: !!alreadyUpvoted,
      analysis
    });
  } catch (error) {
    console.error("Error fetching complaint details:", error);
    res.status(500).json({ message: "Failed to fetch complaint details" });
  }
});















// Get all complaints as posts
citizenRoute.get("/posts", async (req, res) => {
  try {
    const citizenId = req.user;

    const complaints = await Complaint.find()
      .populate("citizenId", "displayName profilePicture")
      .sort({ createdAt: -1 });

    if (!complaints.length) {
      return res.status(200).json({
        message: "No posts found",
        posts: []
      });
    }

    // Collect all complaint IDs
    const complaintIds = complaints.map(c => c._id);

    // ✅ Fetch ALL images for each complaint
    const images = await ComplaintImage.find({ complaintId: { $in: complaintIds } })
      .select("complaintId imageUrl");

    // Group images by complaintId
    const imagesMap = images.reduce((acc, img) => {
      const key = img.complaintId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(img.imageUrl);
      return acc;
    }, {});

    // Fetch upvote counts
    const upvoteCounts = await ComplaintUpvote.aggregate([
      { $match: { complaintId: { $in: complaintIds } } },
      { $group: { _id: "$complaintId", count: { $sum: 1 } } }
    ]);

    // Fetch comment counts
    const commentCounts = await ComplaintComment.aggregate([
      { $match: { complaintId: { $in: complaintIds } } },
      { $group: { _id: "$complaintId", count: { $sum: 1 } } }
    ]);

    // Fetch current user's upvotes
    let userUpvotes = [];
    if (citizenId) {
      userUpvotes = await ComplaintUpvote.find({
        complaintId: { $in: complaintIds },
        citizenId
      }).select("complaintId");
    }

    const userUpvoteSet = new Set(userUpvotes.map(uv => uv.complaintId.toString()));

    // Format posts
    const formattedPosts = complaints.map(complaint => {
      const imgs = imagesMap[complaint._id.toString()] || [];
      const upvotes = upvoteCounts.find(uv => uv._id.toString() === complaint._id.toString());
      const comments = commentCounts.find(c => c._id.toString() === complaint._id.toString());

      return {
        id: complaint._id,
        user: {
          name: complaint.citizenId?.displayName || "Unknown",
          avatar: complaint.citizenId?.profilePicture || null,
          location: complaint.address || "Unknown location"
        },
        images: imgs, // ✅ Now returns ALL images in an array
        caption: complaint.description,
        category: complaint.category,
        status: complaint.status,
        timestamp: complaint.createdAt,
        upvotes: upvotes ? upvotes.count : 0,
        commentCount: comments ? comments.count : 0,
        hasUpvoted: userUpvoteSet.has(complaint._id.toString())
      };
    });

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: formattedPosts
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});







// Get comments for a specific complaint
citizenRoute.get("/complaint/:id/comments", async (req, res) => {
  try {
    const complaintId = req.params.id;

    const comments = await ComplaintComment.find({ complaintId })
      .populate("citizenId", "displayName")
      .sort({ createdAt: -1 })
      .select("comment createdAt citizenId");

    const formattedComments = comments.map(c => ({
      id: c._id,
      user: c.citizenId?.displayName || "Unknown",
      text: c.comment,
      timestamp: c.createdAt,
    }));

    res.status(200).json({
      message: "Comments fetched successfully",
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});


export default citizenRoute;