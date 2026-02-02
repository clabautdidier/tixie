import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminNavbar() {
  const { getUser, hasRole, logout } = useAuth();
  const user = getUser();
  const isAdmin = hasRole('ROLE_ADMIN');
  const isLocAdmin = hasRole('ROLE_CONFIGLOCATIONADMIN') || isAdmin;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admin">
          Tixie Admin
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {isAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="adminDropdown"
                  data-bs-toggle="dropdown"
                >
                  Admin
                </a>
                <ul className="dropdown-menu dropdown-menu-dark">
                  <li>
                    <Link className="dropdown-item" to="/admin/users">
                      User Management
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            {isLocAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="configDropdown"
                  data-bs-toggle="dropdown"
                >
                  Configuration Management
                </a>
                <ul className="dropdown-menu dropdown-menu-dark">
                  <li>
                    <Link className="dropdown-item" to="/admin/properties">
                      Property Library
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/location-types">
                      Location Types
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/locations">
                      Locations
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/configuration-item-types">
                      Configuration Item Types
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/configuration-items">
                      Configuration Items
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            <span className="text-light me-3 small">{user?.username}</span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
