import { useContext, useEffect, useRef, useState } from "react";
import { CTContext } from "../context/CTContext";
import { useNavigate } from "react-router-dom";

export default function ROIPage() {
  const { selectedSlice } = useContext(CTContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [start, setStart] = useState(null);
  const [roi, setROI] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const [locked, setLocked] = useState(false);

  // 🔥 Load image when page opens
  useEffect(() => {
    if (!selectedSlice) {
      navigate("/slices");
      return;
    }

    const img = new Image();
    img.src = selectedSlice.url;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
    };
  }, [selectedSlice, navigate]);

  // 🔥 Redraw when ROI changes
  useEffect(() => {
    redraw();
  }, [roi, currentRect, locked]);

  const redraw = () => {
    if (!selectedSlice) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = selectedSlice.url;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const rectToDraw = currentRect || roi;

      if (rectToDraw) {
        ctx.strokeStyle = locked ? "limegreen" : "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          rectToDraw.x,
          rectToDraw.y,
          rectToDraw.width,
          rectToDraw.height
        );
      }
    };
  };

  // 🔥 Mouse Down
  const handleMouseDown = (e) => {
    if (locked) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStart({ x, y });
    setCurrentRect(null);
  };

  // 🔥 Mouse Move (Live Drawing)
  const handleMouseMove = (e) => {
    if (!start || locked) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentRect({
      x: start.x,
      y: start.y,
      width: x - start.x,
      height: y - start.y,
    });
  };

  // 🔥 Mouse Up
  const handleMouseUp = () => {
    if (!currentRect || locked) return;

    setROI(currentRect);
    setStart(null);
    setCurrentRect(null);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>ROI Selection</h2>

      {/* Buttons */}
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={() => setLocked(true)}
          style={{
            background: locked ? "limegreen" : "#ddd",
            marginRight: "10px",
            padding: "8px 15px",
            cursor: "pointer",
          }}
        >
          Lock ROI
        </button>

        <button
          onClick={() => setLocked(false)}
          style={{
            background: !locked ? "red" : "#ddd",
            color: "white",
            marginRight: "10px",
            padding: "8px 15px",
            cursor: "pointer",
          }}
        >
          Unlock ROI
        </button>

        <button
          onClick={() => setROI(null)}
          style={{
            padding: "8px 15px",
            cursor: "pointer",
          }}
        >
          Clear ROI
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid black",
          maxWidth: "90%",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}