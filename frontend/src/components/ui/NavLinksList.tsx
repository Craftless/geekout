import { AuthContext } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { SetStateAction, useContext } from "react";
import { MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";

const NavLinksList = ({
  setOpen,
}: {
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const auth = useContext(AuthContext);
  function closeDrawerHandler() {
    setOpen(false);
  }
  return (
    <>
      <li>
        <NavLink
          to="/teacher"
          end
          onClick={closeDrawerHandler}
          className={({ isActive }) => cn(isActive && "text-accent-foreground")}
        >
          All Quizzes
        </NavLink>
      </li>
      <li>
        <NavLink
          to={`/teacher/${auth.id}/quizzes`}
          onClick={closeDrawerHandler}
          className={({ isActive }) => cn(isActive && "text-accent-foreground")}
        >
          My Quizzes
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/teacher/quizzes/new"
          onClick={closeDrawerHandler}
          className={({ isActive }) => cn(isActive && "text-accent-foreground")}
        >
          Create Quiz
        </NavLink>
      </li>
      <li>
        <NavLink
          to="#"
          onClick={() => {
            auth.logout();
            closeDrawerHandler();
          }}
        >
          <MdLogout size={24} />
        </NavLink>
      </li>
    </>
  );
};

export default NavLinksList;
