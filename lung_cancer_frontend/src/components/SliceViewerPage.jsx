import { useContext, useState, useEffect, useRef } from "react";
import { CTContext } from "../context/CTContext";

export default function SliceViewerPage() {
  const { slices } = useContext(CTContext);

  const [index, setIndex] = useState(0);
  const [confirmedIndex, setConfirmedIndex] = useState(null);
  const [roiLocked, setRoiLocked] = useState(false);
  const [roiRect, setRoiRect] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  // ================= DRAW IMAGE =================
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

      // redraw ROI if exists
      if (roiRect) {
        ctx.strokeStyle = "red";
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
    if (confirmedIndex === null) {
      drawImage(index);
    }
  }, [index, slices]);

  useEffect(() => {
    if (confirmedIndex !== null) {
      drawImage(confirmedIndex);
    }
  }, [confirmedIndex]);

  if (!slices.length) return <div>No slices found</div>;

  // ================= ROI DRAW =================
  const handleMouseDown = (e) => {
    if (confirmedIndex === null || roiLocked) return;

    drawingRef.current = true;

    const rect = canvasRef.current.getBoundingClientRect();
    startRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e) => {
    if (!drawingRef.current || roiLocked) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - startRef.current.x;
    const height = currentY - startRef.current.y;

    drawImage(confirmedIndex);

    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startRef.current.x,
      startRef.current.y,
      width,
      height
    );
  };

  const handleMouseUp = (e) => {
    if (!drawingRef.current) return;

    drawingRef.current = false;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = endX - startRef.current.x;
    const height = endY - startRef.current.y;

    const finalRect = {
      x: startRef.current.x,
      y: startRef.current.y,
      width,
      height,
    };

    setRoiRect(finalRect);
  };

  const handleClear = () => {
    setConfirmedIndex(null);
    setRoiRect(null);
    setRoiLocked(false);
    setPrediction(null);
  };

  const handlePredict = () => {
    setPrediction("Prediction: Benign (Dummy Output)");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Slice Viewer</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "50px",
          marginTop: "20px",
        }}
      >
        {/* IMAGE */}
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: "850px",
            border: "3px solid #1e3a8a",
            borderRadius: "10px",
            cursor: confirmedIndex !== null ? "crosshair" : "default",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        {/* ROI CONTROLS */}
        {confirmedIndex !== null && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              minWidth: "240px",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#1e3a8a" }}>
              ROI Controls
            </h3>

            <button
              style={{
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "10px",
                background: "#16a34a",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              disabled={roiLocked || !roiRect}
              onClick={() => setRoiLocked(true)}
            >
              Lock ROI
            </button>

            <button
              style={{
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "10px",
                background: "#dc2626",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              disabled={!roiLocked}
              onClick={() => setRoiLocked(false)}
            >
              Unlock ROI
            </button>

            <button
              style={{
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "10px",
                background: "#6b7280",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleClear}
            >
              Clear ROI
            </button>

            {roiLocked && roiRect && (
              <button
                style={{
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "10px",
                  background: "#1d4ed8",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={handlePredict}
              >
                Predict
              </button>
            )}

            {prediction && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  background: "#e0f2fe",
                  borderRadius: "10px",
                  fontWeight: "bold",
                }}
              >
                {prediction}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SLIDER */}
      <div style={{ marginTop: "30px" }}>
        <input
          type="range"
          min="0"
          max={slices.length - 1}
          value={confirmedIndex !== null ? confirmedIndex : index}
          disabled={confirmedIndex !== null}
          onChange={(e) => setIndex(Number(e.target.value))}
          style={{
            width: "750px",
            maxWidth: "90%",
          }}
        />
      </div>

      <p style={{ fontWeight: "bold", marginTop: "10px" }}>
        Slice {(confirmedIndex !== null ? confirmedIndex : index) + 1} /{" "}
        {slices.length}
      </p>

      <button
        disabled={confirmedIndex !== null}
        onClick={() => setConfirmedIndex(index)}
        style={{
          marginTop: "20px",
          padding: "16px 40px",
          fontSize: "18px",
          fontWeight: "bold",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Select Slice For ROI
      </button>
    </div>
  );
}