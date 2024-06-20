import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";

const AuthPage = () => {
  const [signup, setSignup] = useState(false);
  return (
    <div className="mx-auto h-[100svh] flex flex-col justify-center items-center gap-2">
      <AuthForm
        signup={signup}
        onChangeMode={() => {
          setSignup((val) => !val);
        }}
      />
      <Button className="self-center" variant={"link"}>
        <Link to="/">Go back to Home Page</Link>
      </Button>
    </div>
  );
};
export default AuthPage;
