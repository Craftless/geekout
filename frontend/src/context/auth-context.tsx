import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

export interface IAuthContext {
  id: string;
  token: string;
  login: (id: string, token: string, expiration?: number) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext>({
  id: "",
  token: "",
  login: () => {},
  logout: () => {},
});

let logoutTimer: NodeJS.Timeout;
export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState("");
  const [token, setToken] = useState("");
  const [expirationDate, setExpirationDate] = useState(0);

  const login = useCallback(
    (id: string, token: string, expiration?: number) => {
      expiration = expiration || Date.now() + 3000 * 60 * 60;
      setId(id);
      setToken(token);
      setExpirationDate(expiration);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          userId: id,
          token: token,
          expiration,
        })
      );
    },
    []
  );

  const logout = useCallback(() => {
    setId("");
    setToken("");
    setExpirationDate(0);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token) {
      logoutTimer = setTimeout(logout, expirationDate - Date.now());
    } else {
      clearTimeout(logoutTimer);
    }
    return () => {
      clearTimeout(logoutTimer);
    };
  }, [token, logout, expirationDate]);

  return (
    <AuthContext.Provider value={{ id, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
