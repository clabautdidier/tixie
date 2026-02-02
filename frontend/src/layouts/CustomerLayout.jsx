import { Outlet } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';

export default function CustomerLayout() {
  return (
    <>
      <CustomerNavbar />
      <div className="container mt-4">
        <Outlet />
      </div>
    </>
  );
}
