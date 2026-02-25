import { useContext, useState } from "react";
import { CTContext } from "../context/CTContext";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";

export default function UploadPage() {
  const { setSlices } = useContext(CTContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState(null);
  const [ready, setReady] = useState(false);

  // ---------------- DICOM ----------------
  const handleDcmUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("http://localhost:5000/upload-dcm", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setSlices(data.slices || []);
      setReady(true);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // ---------------- ZIP ----------------
  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const zip = await JSZip.loadAsync(file);
    const images = [];
    const promises = [];

    zip.forEach((path, entry) => {
      if (entry.name.toLowerCase().endsWith(".png")) {
        const p = entry.async("blob").then((blob) => {
          images.push({
            name: entry.name,
            url: URL.createObjectURL(blob),
          });
        });
        promises.push(p);
      }
    });

    await Promise.all(promises);
    setSlices(images);
    setReady(true);
  };

  // ---------------- PNG ----------------
  const handlePngUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const images = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setSlices(images);
    setReady(true);
  };

  return (
    <div className="page">
      <h2>Lung CT Viewer</h2>

      <div style={{ marginTop: "20px", display: "flex", gap: "20px", justifyContent: "center" }}>
        <button onClick={() => setMode("dcm")}>Upload DICOM</button>
        <button onClick={() => setMode("zip")}>Upload ZIP</button>
        <button onClick={() => setMode("png")}>Upload PNG</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {mode === "dcm" && (
          <input type="file" multiple accept=".dcm" onChange={handleDcmUpload} />
        )}

        {mode === "zip" && (
          <input type="file" accept=".zip" onChange={handleZipUpload} />
        )}

        {mode === "png" && (
          <input type="file" multiple accept="image/png" onChange={handlePngUpload} />
        )}
      </div>

      {ready && (
        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => navigate("/slices")}
            style={{
              padding: "10px 20px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
            }}
          >
            Go to Slice Viewer →
          </button>
        </div>
      )}
    </div>
  );
}