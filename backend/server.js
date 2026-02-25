const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- FOLDERS ----------------
const UPLOAD_FOLDER = path.join(__dirname, "uploads");
const CONVERTED_FOLDER = path.join(__dirname, "converted_png");

// Create folders if not exist
if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER);
}

if (!fs.existsSync(CONVERTED_FOLDER)) {
  fs.mkdirSync(CONVERTED_FOLDER);
}

// ---------------- MULTER SETUP ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // keep original name for correct order
  },
});

const upload = multer({ storage });

// ---------------- SERVE PNG FILES ----------------
app.use("/png", express.static(CONVERTED_FOLDER));

// ---------------- DICOM UPLOAD ROUTE ----------------
app.post("/upload-dcm", (req, res) => {
  console.log("Upload DCM route triggered");

  // 🔥 1. Clear uploads folder BEFORE saving new files
  fs.readdirSync(UPLOAD_FOLDER).forEach(file => {
    fs.unlinkSync(path.join(UPLOAD_FOLDER, file));
  });

  // 🔥 2. Clear converted folder
  fs.readdirSync(CONVERTED_FOLDER).forEach(file => {
    fs.unlinkSync(path.join(CONVERTED_FOLDER, file));
  });

  // 🔥 3. Now call multer to save new files
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
// ---------------- START SERVER ----------------
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});