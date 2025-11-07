

// /api/vault.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default async function handler(req, res) {
  console.log("📸 GET /api/vault request received");

  try {
    // You can adjust folder name 'aif' or tag if needed
    const [images, videos] = await Promise.all([
      cloudinary.search
        .expression("folder:aif AND resource_type:image")
        .sort_by("created_at", "desc")
        .max_results(50)
        .execute(),
      cloudinary.search
        .expression("folder:aif AND resource_type:video")
        .sort_by("created_at", "desc")
        .max_results(30)
        .execute(),
    ]);

    res.status(200).json({
      images: images.resources.map((r) => r.secure_url),
      videos: videos.resources.map((r) => r.secure_url),
    });
  } catch (err) {
    console.error("❌ Cloudinary fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch from Cloudinary" });
  }
}
