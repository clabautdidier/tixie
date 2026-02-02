import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function AdminNavbar() {
  const { getUser, hasRole, logout } = useAuth();
  const user = getUser();
  const isAdmin = hasRole('ROLE_ADMIN');
  const isLocAdmin = hasRole('ROLE_CONFIGLOCATIONADMIN') || isAdmin;
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="text-xl font-semibold">
              Tixie Admin
            </Link>
            <div className="hidden md:flex md:ml-10 md:space-x-4">
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => { setAdminOpen(!adminOpen); setConfigOpen(false); }}
                    className="px-3 py-2 rounded-md hover:bg-gray-700 flex items-center gap-1"
                  >
                    Admin
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {adminOpen && (
                    <div className="absolute left-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 hover:bg-gray-600"
                        onClick={() => setAdminOpen(false)}
                      >
                        User Management
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {isLocAdmin && (
                <div className="relative">
                  <button
                    onClick={() => { setConfigOpen(!configOpen); setAdminOpen(false); }}
                    className="px-3 py-2 rounded-md hover:bg-gray-700 flex items-center gap-1"
                  >
                    Configuration Management
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {configOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-gray-700 rounded-md shadow-lg py-1 z-50">
                      <Link to="/admin/properties" className="block px-4 py-2 hover:bg-gray-600" onClick={() => setConfigOpen(false)}>Property Library</Link>
                      <Link to="/admin/location-types" className="block px-4 py-2 hover:bg-gray-600" onClick={() => setConfigOpen(false)}>Location Types</Link>
                      <Link to="/admin/locations" className="block px-4 py-2 hover:bg-gray-600" onClick={() => setConfigOpen(false)}>Locations</Link>
                      <Link to="/admin/configuration-item-types" className="block px-4 py-2 hover:bg-gray-600" onClick={() => setConfigOpen(false)}>Configuration Item Types</Link>
                      <Link to="/admin/configuration-items" className="block px-4 py-2 hover:bg-gray-600" onClick={() => setConfigOpen(false)}>Configuration Items</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">{user?.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm border border-gray-500 rounded hover:bg-gray-700"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
