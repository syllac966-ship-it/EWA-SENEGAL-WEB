import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 text-gray-600">
      <p className="text-4xl font-bold text-primary-700">404</p>
      <p>Page introuvable.</p>
      <Link to="/login" className="text-sm font-medium text-primary-600 hover:underline">
        Retour à la connexion
      </Link>
    </div>
  );
}
