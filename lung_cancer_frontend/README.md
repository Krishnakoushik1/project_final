# 🫁 AI-Based Lung Cancer Detection Using CT Images

This project allows users to:

- Upload DICOM CT scan slices
- Convert DICOM to PNG
- View slices with a vertical slider
- Select a slice
- Draw a Region of Interest (ROI)
- Send selected slice + ROI to backend
- Receive prediction response (dummy for now)

---

# 📂 Project Structure

---

# 🛠️ TECHNOLOGIES USED

## Frontend
- React.js
- JSZip

## Backend
- Node.js
- Express.js
- Multer
- Python (DICOM conversion)

## Python
- pydicom
- numpy
- Pillow
- OpenCV

---

# ⚙️ COMPLETE SETUP GUIDE (FROM SCRATCH)

## 🔹 1️⃣ Clone the Repository
        myclonerepo:https://github.com/Krishnakoushik1/project_final.git


---

## 🔹 2️⃣ Install Node.js

Download from:
https://nodejs.org

Verify installation:
`node -v`
`npm -v`




---

## 🔹 3️⃣ Setup Backend


cd backend
npm install


### Install Python dependencies:

Make sure Python 3.9+ is installed:

python --version

Install requirements:

pip install -r requirements.txt

---
## 🔹 4️⃣ Start Backend Server

node server.js

You should see:
Server running on http://localhost:5000
---
## 🔹 5️⃣ Setup Frontend
Open new terminal:

cd frontend
npm install
npm install jszip
---
## 🔹 6️⃣ Start Frontend

npm start
Frontend runs at:
http://localhost:3000
---
# 🧠 HOW THE SYSTEM WORKS

1. Upload DICOM files
2. Backend converts DICOM → PNG
3. Frontend displays slices
4. User selects slice
5. User draws ROI
6. ROI + selected slice sent to backend
7. Backend:
   - Saves ROI JSON
   - Stores selected slice DCM
   - Returns dummy prediction
8. Frontend displays prediction below Predict button
----
# 📁 Backend Data Storage

- uploads/ → all uploaded DICOM files
- converted_png/ → PNG images
- received_data/ → ROI JSON files
- selected_slice/ → only selected slice DCM (auto replaced)

---
# 🔮 Future Improvements

- Integrate trained PyTorch model
- ROI cropping in backend
- Heatmap visualization
- Confidence graph display
- Deploy to cloud (Render / AWS)

---
# 🧪 Example Prediction Response

```json
{
  "prediction": "Malignant",
  "confidence": 0.91,
  "num_slices_used": 9
}