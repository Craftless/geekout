import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";

const UnauthenticatedRoutesComponent = () => {
  const auth = useContext(AuthContext);
  return !auth.token ? <Outlet /> : <Navigate to="/teacher" />;
};

export default UnauthenticatedRoutesComponent;
