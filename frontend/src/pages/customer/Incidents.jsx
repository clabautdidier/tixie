import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/api';

function getStatusBadge(status) {
  const map = {
    OPEN: <span className="badge bg-danger">Open</span>,
    IN_PROGRESS: <span className="badge bg-warning">In behandeling</span>,
    RESOLVED: <span className="badge bg-info">Opgelost</span>,
    CLOSED: <span className="badge bg-secondary">Gesloten</span>
  };
  return map[status] || status;
}

function getPriorityBadge(priority) {
  const map = {
    LOW: <span className="badge bg-secondary">Laag</span>,
    MEDIUM: <span className="badge bg-primary">Normaal</span>,
    HIGH: <span className="badge bg-warning">Hoog</span>,
    CRITICAL: <span className="badge bg-danger">Kritiek</span>
  };
  return map[priority] || priority;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getIncidents()
      .then((data) => {
        setIncidents(data || []);
        setError('');
      })
      .catch((err) => {
        setError('Fout bij het laden van incidenten: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!incidents.length) {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Mijn Incidenten</h1>
          <Link to="/incidents/new" className="btn btn-success">
            + Nieuw Incident
          </Link>
        </div>
        <div className="alert alert-info">
          U heeft nog geen incidenten gemeld. <Link to="/incidents/new">Meld uw eerste incident</Link>.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mijn Incidenten</h1>
        <Link to="/incidents/new" className="btn btn-success">
          + Nieuw Incident
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Status</th>
                <th>Prioriteit</th>
                <th>Aangemaakt</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.uuid}>
                  <td>{inc.title}</td>
                  <td>{getStatusBadge(inc.status)}</td>
                  <td>{getPriorityBadge(inc.priority)}</td>
                  <td>{new Date(inc.createdAt).toLocaleString('nl-NL')}</td>
                  <td>
                    <Link to={`/incidents/${inc.uuid}`} className="btn btn-sm btn-primary">
                      Bekijken
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
