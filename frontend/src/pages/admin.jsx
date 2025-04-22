import Sidebaradmin from '../components/Sidebaradmin';
import { Outlet } from "react-router-dom";
const Admin = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebaradmin />
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet /> {/* هذا ضروري جدًا */}
      </div>
    </div>
  );
};

export default Admin;

