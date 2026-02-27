const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= FOLDERS ================= */

const UPLOAD_FOLDER = path.join(__dirname, "uploads");
const CONVERTED_FOLDER = path.join(__dirname, "converted_png");
const RECEIVED_FOLDER = path.join(__dirname, "received_data");
const SELECTED_SLICE_FOLDER = path.join(__dirname, "selected_slice"); // 🔥 NEW FOLDER

// Create folders if not exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER);
}

if (!fs.existsSync(CONVERTED_FOLDER)) {
  fs.mkdirSync(CONVERTED_FOLDER);
}

if (!fs.existsSync(RECEIVED_FOLDER)) {
  fs.mkdirSync(RECEIVED_FOLDER);
}

if (!fs.existsSync(SELECTED_SLICE_FOLDER)) {   // 🔥 NEW
  fs.mkdirSync(SELECTED_SLICE_FOLDER);
}

/* ================= MULTER SETUP ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/* ================= SERVE PNG FILES ================= */

app.use("/png", express.static(CONVERTED_FOLDER));

/* ================= DICOM UPLOAD ROUTE ================= */

app.post("/upload-dcm", (req, res) => {
  console.log("Upload DCM route triggered");

  // Clear uploads folder
  fs.readdirSync(UPLOAD_FOLDER).forEach(file => {
    fs.unlinkSync(path.join(UPLOAD_FOLDER, file));
  });

  // Clear converted folder
  fs.readdirSync(CONVERTED_FOLDER).forEach(file => {
    fs.unlinkSync(path.join(CONVERTED_FOLDER, file));
  });

  upload.array("files")(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Upload failed" });
    }

    const command = `python convert.py "${UPLOAD_FOLDER}" "${CONVERTED_FOLDER}"`;

    exec(command, (error, stdout) => {
      if (error) {
        console.error("Conversion Error:", error);
        return res.status(500).json({ error: "Conversion failed" });
      }

      const files = stdout
        .trim()
        .split("\n")
        .filter(Boolean);

      const slices = files.map((file) => ({
        name: file,
        url: `http://localhost:5000/png/${file}`,
      }));

      console.log("Converted slices:", slices.length);

      res.json({ slices });
    });
  });
});

/* ================= PREDICT ROUTE ================= */

app.post("/predict", upload.single("file"), (req, res) => {

  console.log("\n========= PREDICT API CALLED =========\n");

  let metadata = null;

  try {
    metadata = JSON.parse(req.body.metadata);
    console.log("Slice Index:", metadata.slice_index);
    console.log("ROI:", metadata.roi);
  } catch (err) {
    console.log("Metadata parsing failed:", err);
  }

  // 🔥 SAVE ROI JSON FILE (unchanged behavior)
  if (metadata) {
    const jsonPath = path.join(
      RECEIVED_FOLDER,
      `roi_${Date.now()}.json`
    );

    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
    console.log("ROI JSON saved at:", jsonPath);
  }

  // 🔥 SAVE SELECTED SLICE DCM IN NEW FOLDER
  if (req.file) {

    // Clear previous selected slice
    fs.readdirSync(SELECTED_SLICE_FOLDER).forEach(file => {
      fs.unlinkSync(path.join(SELECTED_SLICE_FOLDER, file));
    });

    const newPath = path.join(SELECTED_SLICE_FOLDER, req.file.originalname);

    fs.copyFileSync(req.file.path, newPath);

    console.log("Selected slice copied to:", newPath);
  } else {
    console.log("No file received");
  }

  console.log("\n======================================\n");

  // Dummy prediction response
  res.json({
    prediction: "Malignant",
    confidence: 0.91,
    num_slices_used: 9,
    slice_confidences: [0.88, 0.91, 0.93, 0.90, 0.87, 0.89, 0.92, 0.90, 0.91],
    heatmap: null,
    xai_summary: {
      primary_focus: "Irregular border region",
      supporting_evidence: [
        "High activation around spiculated margins",
        "Heterogeneous internal texture"
      ],
      interpretation: "Findings consistent with malignant morphology"
    }
  });

});

/* ================= START SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});