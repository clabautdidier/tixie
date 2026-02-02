import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api';

function getStatusBadge(status) {
  const map = {
    OPEN: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Open</span>,
    IN_PROGRESS: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">In behandeling</span>,
    RESOLVED: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Opgelost</span>,
    CLOSED: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Gesloten</span>
  };
  return map[status] || status;
}

function getPriorityBadge(priority) {
  const map = {
    LOW: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Laag</span>,
    MEDIUM: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Normaal</span>,
    HIGH: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Hoog</span>,
    CRITICAL: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Kritiek</span>
  };
  return map[priority] || priority;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getIncidents()
      .then((data) => { setIncidents(data || []); setError(''); })
      .catch((err) => setError('Fout bij het laden van incidenten: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  if (!incidents.length) {
    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mijn Incidenten</h1>
          <Link to="/incidents/new" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            + Nieuw Incident
          </Link>
        </div>
        <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
          U heeft nog geen incidenten gemeld. <Link to="/incidents/new" className="underline font-medium">Meld uw eerste incident</Link>.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mijn Incidenten</h1>
        <Link to="/incidents/new" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          + Nieuw Incident
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioriteit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aangemaakt</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.map((inc) => (
              <tr key={inc.uuid} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{inc.title}</td>
                <td className="px-4 py-3">{getStatusBadge(inc.status)}</td>
                <td className="px-4 py-3">{getPriorityBadge(inc.priority)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(inc.createdAt).toLocaleString('nl-NL')}</td>
                <td className="px-4 py-3">
                  <Link to={`/incidents/${inc.uuid}`} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Bekijken
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
