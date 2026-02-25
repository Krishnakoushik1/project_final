import { useContext, useState, useEffect, useRef } from "react";
import { CTContext } from "../context/CTContext";
import { useNavigate } from "react-router-dom";

export default function SliceViewerPage() {
  const { slices, setSelectedSlice } = useContext(CTContext);
  const [index, setIndex] = useState(0);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slices.length) return;

    const img = new Image();
    img.src = slices[index].url;

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
    };
  }, [index, slices]);

  if (!slices.length) return <div>No slices found</div>;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>CT Viewer</h2>

      {/* BIG IMAGE */}
      <canvas
        ref={canvasRef}
        style={{
          width: "600px",
          maxWidth: "90%",
          border: "2px solid black",
        }}
      />

      {/* SCROLL BAR BELOW IMAGE */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="range"
          min="0"
          max={slices.length - 1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          style={{ width: "700px", maxWidth: "90%" }}
        />
      </div>

      <p>
        Slice {index + 1} / {slices.length}
      </p>

      {/* BUTTON BELOW SCROLLBAR */}
      <div style={{ marginTop: "15px" }}>
        <button
          onClick={() => {
            setSelectedSlice(slices[index]);
            navigate("/roi");
          }}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Select ROI
        </button>
      </div>
    </div>
  );
}