import { QueryClientProvider } from "@tanstack/react-query";
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
import StudentLobby from "./pages/StudentLobby";
import StudentQuizPage from "./pages/StudentQuizPage";
import AllQuizzesListPage from "./pages/teacher/AllQuizzesListPage";
import CreateQuizPage from "./pages/teacher/CreateQuizPage";
import HostLobby from "./pages/teacher/HostLobby";
import TeacherQuizPage from "./pages/teacher/TeacherQuizPage";
import UserQuizzesListPage from "./pages/teacher/UserQuizzesListPage";
import ViewQuizPage from "./pages/teacher/ViewQuizPage";
import { queryClient } from "./utils/http";

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
          {
            path: "start",
            element: <StudentQuizPage />,
          },
          {
            path: "lobby",
            element: <StudentLobby />,
          },
        ],
      },
      {
        path: "teacher",
        element: <TeacherRoutesComponent />,
        children: [
          {
            index: true,
            element: <AllQuizzesListPage />,
          },
          {
            path: ":uid/quizzes",
            element: <UserQuizzesListPage />,
          },
          {
            path: "quizzes/new",
            element: <CreateQuizPage />,
          },
          {
            path: "quizzes/view/:qid",
            element: <ViewQuizPage />,
          },
          {
            path: "host/lobby/:qid",
            element: <HostLobby />,
          },
          {
            path: "host",
            element: <TeacherQuizPage />,
          },
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
