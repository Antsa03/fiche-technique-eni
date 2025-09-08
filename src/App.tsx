import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/layouts/Header";
import Footer from "./components/layouts/Footer";
import FicheTechniquePage from "./pages/fiche-technique";
import LoginPage from "./pages/login";
import { ProtectedRoute } from "./components/protected-route";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/fiche-technique"
              element={
                <ProtectedRoute>
                  <FicheTechniquePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>

      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
