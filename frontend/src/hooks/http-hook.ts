import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/auth-context";
import axios, { AxiosError } from "axios";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const auth = useContext(AuthContext);

  const activeHttpRequests = useRef<AbortController[]>([]);

  const sendRequest = useCallback(
    async (
      url: string,
      headers = {},
      method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
      body: any = null
    ) => {
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);
      try {
        const response = await axios({
          method,
          url,
          headers,
          data: body,
          signal: httpAbortCtrl.signal,
        });
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );
        return response.data;
      } catch (err) {
        let errorCode, errorMessage;
        let erro;
        if (axios.isAxiosError(err)) {
          const receivedError = err as AxiosError;
          if (receivedError.message === "canceled") throw err;
          errorCode = receivedError.code;
          errorMessage =
            (receivedError.response?.data as any)?.message ||
            receivedError.message;
          setError(errorMessage);
        } else {
          erro = String(err);
          console.log(erro);
          setError(erro);
        }
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong. " + errorCode,
          description: errorMessage || "There was a problem with your request.",
          duration: 3000,
        });
        if (errorMessage.includes("log in again")) auth.logout();
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = () => {
    setError("");
  };

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};

/*
toast({
  variant: "destructive",
  title: "Uh oh! Something went wrong.",
  description: "There was a problem with your request. " + JSON.stringify(message),
  action: <ToastAction altText="Try again">Try again</ToastAction>,
});
*/
