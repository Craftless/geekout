import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import MainNavigation from "../ui/MainNavigation";

const TeacherRoutesComponent = () => {
  const auth = useContext(AuthContext);
  return (
    <div>
      {auth.token && (
        <>
          <MainNavigation />
          <main className="mt-16">
            <Outlet />
          </main>
        </>
      )}
      {!auth.token && <Navigate to="/auth" />}
    </div>
  );
};

export default TeacherRoutesComponent;
