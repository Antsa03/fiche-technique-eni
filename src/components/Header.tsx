export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
              {/* Placeholder pour le logo ENI */}
              <img src="/src/assets/eni-logo.png" alt="ENI Logo" className="w-16 h-16" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                École Nationale d'Informatique
              </h1>
              <p className="text-sm text-gray-600">
                Système de Fiche Technique
              </p>
            </div>
          </div>

          {/* Navigation ou actions additionnelles */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Fianarantsoa, Madagascar
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
