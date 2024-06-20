import { Suspense, useContext, useLayoutEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import TeacherRoutesComponent from "./components/auth/TeacherRoutesComponent";
import UnauthenticatedRoutesComponent from "./components/auth/UnauthenticatedRoutesComponent";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { AuthContext } from "./context/auth-context";
import AuthPage from "./pages/AuthPage";
import Error from "./pages/Error";
import HomePage from "./pages/HomePage";
import RootLayout from "./pages/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <RootLayout />
      </Suspense>
    ),
    errorElement: <Error />,
    children: [
      {
        path: "",
        element: <UnauthenticatedRoutesComponent />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "auth",
            element: <AuthPage />,
          },
        ],
      },
      {
        path: "teacher",
        element: <TeacherRoutesComponent />,
        children: [
          // teacher pages
        ],
      },
    ],
  },
]);

function App() {
  const auth = useContext(AuthContext);
  useLayoutEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const storedData = JSON.parse(userData);
      if (
        storedData &&
        storedData.token &&
        storedData.expiration > Date.now()
      ) {
        auth.login(storedData.userId, storedData.token, storedData.expiration);
      }
    }
  }, [auth, auth.login]);
  return (
    // <QueryClientProvider client={queryClient}> tanstack query
    <RouterProvider router={router} />
    // </QueryClientProvider>
  );
}

export default App;
