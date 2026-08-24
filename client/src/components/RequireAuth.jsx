import { Navigate, useLocation, Outlet } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { useGetMeQuery } from "../redux/auth/authApi";

const RequireAuth = () => {
  const location = useLocation();
  const { data, isLoading, isError } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
