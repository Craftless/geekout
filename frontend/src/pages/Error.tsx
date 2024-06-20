import MainNavigation from "@/components/ui/MainNavigation";
import { AuthContext } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { useRouteError } from "react-router-dom";

interface Error {
  data?: {
    message?: string;
  };
  status?: number;
}

const Error = () => {
  const error: Error = useRouteError() as Error;
  const auth = useContext(AuthContext);

  let title = "An error occurred";
  let message = error.data?.message || "Something went wrong!";

  if (error.status === 404) {
    title = "Not found!";
    message = "Could not find resource or page.";
  }

  return (
    <div>
      {auth.token && <MainNavigation />}
      <main className={cn(auth.token && "mt-16")}>
        <p>{title}</p>
        <p>{message}</p>
      </main>
    </div>
  );
};

export default Error;
