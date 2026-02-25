import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./components/UploadPage";
import SliceViewerPage from "./components/SliceViewerPage";
import ROIPage from "./components/ROIPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/slices" element={<SliceViewerPage />} />
        <Route path="/roi" element={<ROIPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;