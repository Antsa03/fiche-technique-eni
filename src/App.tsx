import "./App.css";
import FicheTechniqueForm from "./components/FicheTechniqueForm";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <FicheTechniqueForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
