import { Navigate, Outlet } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { useGetMeQuery } from "../redux/auth/authApi";

const RequireSuperAdmin = () => {
  const { data, isLoading } = useGetMeQuery();

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <HashLoader color="#4b6fee" />
      </div>
    );
  }

  if (data?.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireSuperAdmin;
