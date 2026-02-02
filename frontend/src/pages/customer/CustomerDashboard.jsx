import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
  const { getUser } = useAuth();
  const user = getUser();
  const displayName = user?.fullName || user?.username || '';

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Welkom in het Customer Portaal</h1>
      <p className="mt-2 text-gray-600">Welkom terug{displayName ? `, ${displayName}` : ''}!</p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-green-600 text-white px-4 py-3">
            <h3 className="font-semibold">Mijn Incidenten</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">Bekijk en beheer uw incidentmeldingen.</p>
            <Link
              to="/incidents"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Naar Incidenten
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-3">
            <h3 className="font-semibold">Nieuw Incident Melden</h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4">Meld een nieuw incident of probleem.</p>
            <Link
              to="/incidents/new"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Nieuw Incident
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
