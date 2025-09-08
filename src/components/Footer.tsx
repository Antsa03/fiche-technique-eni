import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Section principale avec logo */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo et description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="eni-logo.png"
                alt="ENI Logo"
                className="w-16 h-16 rounded-full border-2 border-gray-300"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900">ENI</h3>
                <p className="text-xs text-gray-600">Fianarantsoa</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              École Nationale d'Informatique - Formation d'excellence en
              informatique
            </p>
          </div>

          {/* À propos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              À propos
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Site web pour envoyer la fiche technique à l'ENI. Plateforme
              dédiée aux étudiants et encadreurs.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                Système de Gestion
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Contact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group">
                <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <span className="text-sm text-gray-900">038 96 566 96</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 group">
                <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a
                    href="mailto:scolarite@eni.mg"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    scolarite@eni.mg
                  </a>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="flex items-center space-x-2 pt-2">
                <a
                  href="#"
                  className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors group"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 p-2 rounded-lg hover:bg-blue-900 transition-colors group"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Localisation
            </h3>
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-red-600 p-2 rounded-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Adresse</p>
                <span className="text-sm text-gray-900">
                  Tanambao Fianarantsoa
                </span>
                <p className="text-xs text-gray-500 mt-1">Madagascar</p>
              </div>
            </div>

            {/* Zone pour la carte améliorée */}
           
          </div>
        </div>

        {/* Séparateur avec design */}
        <hr className="border-gray-300 mb-6" />

        {/* Footer bottom avec informations supplémentaires */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} École Nationale d'Informatique (ENI)
              Fianarantsoa.
            </p>
            <p className="text-xs text-gray-500">
              Tous droits réservés. Système de fiche technique v2.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
