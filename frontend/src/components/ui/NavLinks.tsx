import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import styles from "./NavLinks.module.css";

// million-ignore
const NavLinks = () => {
  const auth = useContext(AuthContext);
  return (
    <ul className={styles["nav-links"]}>
      <li>
        <NavLink to="/teacher/" end>
          All Quizzes
        </NavLink>
      </li>
      <li>
        <NavLink to={`/teacher/${auth.id}/quizzes`}>My Quizzes</NavLink>
      </li>
      <li>
        <NavLink to="/teacher/quizzes/new">Create Quiz</NavLink>
      </li>
      <li>
        <NavLink
          to="#"
          onClick={() => {
            auth.logout();
          }}
        >
          Logout
        </NavLink>
      </li>
    </ul>
  );
};

export default NavLinks;
