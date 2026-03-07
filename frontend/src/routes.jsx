import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Layout from './layout';
import SignUp from './Pages/SignUp';
import ForgotPassword from './Pages/ForgotPassword';
import Dashboard from "./Pages/Dashboard"
import SetPassword from './Pages/SetPassword';
import { useSelector } from 'react-redux';

import Otp from './Pages/Otp';


import Logs from './Pages/Logs';
import EmailConfigManager from './Pages/EmailConfigManager';
import ReportPage from './Pages/Report';
import WebRTCWithImages from './Pages/Streaming';
import VehicleRegister from './Pages/VechileRegistration';
import AdityaBirlaLogin from './Pages/Login';



function GuestOnly({ children }) {
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  console.log(authenticated,"time");
  
  const hasStoredAuth = () => {
    try {
      const authData = localStorage.getItem('authData');
      return authData && JSON.parse(authData).access_token;
    } catch {
      return false;
    }
  };
  
  return (authenticated || hasStoredAuth()) ? 
    <Navigate to="/app/dashboard" replace /> : children;
}

function AuthRequired({ requiredRoles = [], children }) {
  const user = useSelector((state) => state.auth.user);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  let rolePermitted = true;
  if (requiredRoles.length) {
    rolePermitted = requiredRoles.includes(user?.role);
  }
  return authenticated && rolePermitted ? children : <div>lkjkhvghklhg</div>;
}

const router = createBrowserRouter([
  {
    path: '/auth/login',
    element: (
      // <GuestOnly>
        <AdityaBirlaLogin />
      //  </GuestOnly>
    ),
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/',
  element: <Navigate to="/app/dashboard" replace />
  },
  {
    path: '/app/',
    element: (
      <AuthRequired requiredRoles={["admin"]}>
        <Layout />
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      
      {
        path: 'logs',
          element: <Logs />,
       
      },
      {
        path: 'all-vechiles',
          element: <VehicleRegister />,
       
      },
      {
        path: 'live-streaming',
        element: <WebRTCWithImages />,
      },
      {
        path: 'reports',
        element: <ReportPage />,
      },

            {
        path: 'configuration',
       element: <EmailConfigManager />,
      },


    ],
  },
  {
    path: '*',
    element: (
      <div>
        404 - Page Not Found. The requested URL: {window.location.pathname} does not exist.
      </div>
    ),
  },
]);

export default router;
