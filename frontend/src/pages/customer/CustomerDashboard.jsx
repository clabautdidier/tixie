import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
  const { getUser } = useAuth();
  const user = getUser();
  const displayName = user?.fullName || user?.username || '';

  return (
    <>
      <h1>Welkom in het Customer Portaal</h1>
      <p id="welcomeMessage">Welkom terug{displayName ? `, ${displayName}` : ''}!</p>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Mijn Incidenten</h5>
            </div>
            <div className="card-body">
              <p>Bekijk en beheer uw incidentmeldingen.</p>
              <Link to="/incidents" className="btn btn-success">
                Naar Incidenten
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Nieuw Incident Melden</h5>
            </div>
            <div className="card-body">
              <p>Meld een nieuw incident of probleem.</p>
              <Link to="/incidents/new" className="btn btn-info">
                Nieuw Incident
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
