import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";

export default function MainPage() {
  const [slices, setSlices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmedIndex, setConfirmedIndex] = useState(null);

  const [roiRect, setRoiRect] = useState(null);
  const [roiLocked, setRoiLocked] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const resetState = () => {
    setConfirmedIndex(null);
    setRoiRect(null);
    setRoiLocked(false);
    setPrediction(null);
  };

  useEffect(() => {
    if (slices.length > 0) {
      setTimeout(() => {
        viewerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [slices]);

  const drawImage = (sliceIndex) => {
    if (!slices.length) return;

    const img = new Image();
    img.src = slices[sliceIndex].url;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      if (roiRect) {
        ctx.strokeStyle = roiLocked ? "limegreen" : "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          roiRect.x,
          roiRect.y,
          roiRect.width,
          roiRect.height
        );
      }
    };
  };

  useEffect(() => {
    drawImage(
      confirmedIndex !== null ? confirmedIndex : selectedIndex
    );
  }, [selectedIndex, confirmedIndex, slices, roiRect, roiLocked]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    if (confirmedIndex === null || roiLocked) return;
    drawingRef.current = true;
    startRef.current = getCanvasCoordinates(e);
  };

  const handleMouseMove = (e) => {
    if (!drawingRef.current || roiLocked) return;

    const current = getCanvasCoordinates(e);

    setRoiRect({
      x: startRef.current.x,
      y: startRef.current.y,
      width: current.x - startRef.current.x,
      height: current.y - startRef.current.y,
    });
  };

  const handleMouseUp = () => {
    drawingRef.current = false;
  };

  const handleClear = () => {
    setRoiRect(null);
    setRoiLocked(false);
    setPrediction(null);
    setConfirmedIndex(null);
  };

  // ================= PREDICT =================
// ================= PREDICT =================
const handlePredict = async () => {

  if (!roiRect) return;

  const payload = {
    slice_index: selectedIndex,
    roi: {
      x: roiRect.x,
      y: roiRect.y,
      width: roiRect.width,
      height: roiRect.height
    }
  };

  console.log("Sending payload:", payload);

  const formData = new FormData();
  formData.append("metadata", JSON.stringify(payload));

  // attach original file (png or dcm)
  if (slices[selectedIndex]?.file) {
    formData.append("file", slices[selectedIndex].file);
  }

  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    console.log("Backend Response:", data);

    setPrediction(data);

  } catch (error) {
    console.error("Prediction error:", error);
  }
};

  // ================= UPLOAD =================
  const handlePngUpload = (e) => {
    const files = Array.from(e.target.files);
    const images = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));

    resetState();
    setSlices(images);
    setSelectedIndex(0);
  };

  const handleDcmUpload = async (e) => {
    const files = Array.from(e.target.files);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await fetch("http://localhost:5000/upload-dcm", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    // attach original file to slice
    const images = files.map((file, index) => ({
      name: file.name,
      url: data.slices[index].url,
      file: file
    }));

    resetState();
    setSlices(images);
    setSelectedIndex(0);
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    const zip = await JSZip.loadAsync(file);
    const images = [];

    const promises = [];
    zip.forEach((path, entry) => {
      if (entry.name.toLowerCase().endsWith(".png")) {
        promises.push(
          entry.async("blob").then((blob) => {
            images.push({
              name: entry.name,
              url: URL.createObjectURL(blob),
              file: blob
            });
          })
        );
      }
    });

    await Promise.all(promises);

    resetState();
    setSlices(images);
    setSelectedIndex(0);
  };

  return (
    <div className="main-body">

      {/* DESCRIPTION */}
      <section className="section">
        <div className="info-box">
          <h2>Project Description</h2>
          <p>
            AI-based lung cancer detection using CT scan images.
            Upload slices, select a region of interest (ROI),
            and generate prediction results.
          </p>
        </div>
      </section>

      {/* GUIDELINES */}
      <section className="section">
        <div className="info-box">
          <h2>Guidelines</h2>
          <ul style={{ textAlign: "left", marginTop: "15px" }}>
            <li>Upload PNG, DICOM, or ZIP files.</li>
            <li>Select a slice before drawing ROI.</li>
            <li>Draw only one ROI.</li>
            <li>Lock ROI before predicting.</li>
            <li>Clear ROI to change slice.</li>
          </ul>
        </div>
      </section>

      {/* Upload */}
      <section className="section">
        <h2>Upload CT Data</h2>
        <div className="upload-options">
          <button onClick={() => document.getElementById("pngInput").click()}>
            Upload PNG
          </button>
          <button onClick={() => document.getElementById("dcmInput").click()}>
            Upload DICOM
          </button>
          <button onClick={() => document.getElementById("zipInput").click()}>
            Upload ZIP
          </button>
        </div>

        <input id="pngInput" type="file" multiple accept=".png" style={{ display: "none" }} onChange={handlePngUpload} />
        <input id="dcmInput" type="file" multiple accept=".dcm" style={{ display: "none" }} onChange={handleDcmUpload} />
        <input id="zipInput" type="file" accept=".zip" style={{ display: "none" }} onChange={handleZipUpload} />
      </section>

      {slices.length > 0 && (
        <section className="section" ref={viewerRef}>
          <h2>Slice Viewer</h2>

          <div className="slice-layout">

            <div className="roi-panel">
              {confirmedIndex !== null && (
                <>
                  <h3>ROI Controls</h3>
                  <button className="btn lock"
                    disabled={roiLocked || !roiRect}
                    onClick={() => setRoiLocked(true)}>
                    Lock ROI
                  </button>

                  <button className="btn unlock"
                    disabled={!roiLocked}
                    onClick={() => setRoiLocked(false)}>
                    Unlock ROI
                  </button>

                  <button className="btn clear" onClick={handleClear}>
                    Clear ROI
                  </button>
                </>
              )}
            </div>

            <canvas
              ref={canvasRef}
              className="slice-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />

            <input
              type="range"
              min="0"
              max={slices.length - 1}
              value={selectedIndex}
              disabled={confirmedIndex !== null}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="vertical-slider"
            />
          </div>

          <div style={{ marginTop: "10px", fontWeight: "bold" }}>
            Slice {selectedIndex + 1} / {slices.length}
          </div>

          <button
            className="select-slice-btn"
            disabled={confirmedIndex !== null}
            onClick={() => setConfirmedIndex(selectedIndex)}
          >
            Select Slice For ROI
          </button>

          {confirmedIndex !== null && roiLocked && roiRect && (
            <div style={{ marginTop: "30px", textAlign: "center" }}>
              <button
                className="btn predict"
                onClick={handlePredict}
                style={{ display: "block", margin: "0 auto" }}
              >
                Predict
              </button>

              {prediction && (
                <div
                  className="result-box"
                  style={{
                    marginTop: "20px",
                    width: "500px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    textAlign: "left"
                  }}
                >
                  <h3>Prediction Result</h3>

                  <p><strong>Class:</strong> {prediction.prediction}</p>
                  <p><strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%</p>
                  <p><strong>Slices Used:</strong> {prediction.num_slices_used}</p>

                  <p><strong>Primary Focus:</strong> {prediction.xai_summary.primary_focus}</p>

                  <p><strong>Interpretation:</strong> {prediction.xai_summary.interpretation}</p>

                  <strong>Supporting Evidence:</strong>
                  <ul>
                    {prediction.xai_summary.supporting_evidence.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}