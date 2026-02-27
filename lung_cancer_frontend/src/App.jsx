import MainPage from "./components/MainPage";
import "./styles.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>XAI - Based Lung Nodule Diagnosis Using Multi-Slice CT Imaging </h1>
      </header>

      <main className="app-main">
        <MainPage />
      </main>

      <footer className="app-footer">
        <p>Team Members: Your Team Names Here</p>
        <p>Guide: Guide Name Here</p>
        <p>Final Year Project 2025</p>
      </footer>
    </div>
  );
}

export default App;