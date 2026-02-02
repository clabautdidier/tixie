import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function CustomerNavbar() {
  const { getUser, logout } = useAuth();
  const user = getUser();
  const displayName = user?.fullName || user?.username || 'Gebruiker';

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Nieuwe wachtwoorden komen niet overeen.');
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess('Wachtwoord succesvol gewijzigd.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <nav className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-semibold">
                Tixie Customer Portal
              </Link>
              <div className="hidden md:flex gap-4">
                <Link to="/" className="px-3 py-2 rounded-md hover:bg-green-500">
                  Dashboard
                </Link>
                <Link to="/incidents" className="px-3 py-2 rounded-md hover:bg-green-500">
                  Mijn Incidenten
                </Link>
                <Link to="/incidents/new" className="px-3 py-2 rounded-md hover:bg-green-500">
                  Nieuw Incident
                </Link>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 px-3 py-2 border border-white/50 rounded hover:bg-green-500"
              >
                {displayName}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white text-gray-900 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profiel
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => { setShowPasswordModal(true); setUserMenuOpen(false); }}
                  >
                    Wachtwoord wijzigen
                  </button>
                  <hr className="my-1" />
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                  >
                    Uitloggen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Wachtwoord wijzigen</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Huidig wachtwoord</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw wachtwoord</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig nieuw wachtwoord</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
                {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
              </div>
              <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Annuleren
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Wijzigen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
