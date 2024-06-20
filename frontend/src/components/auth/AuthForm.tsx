import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useHttpClient } from "@/hooks/http-hook";
import { Field, Form, Formik } from "formik";
import { useContext } from "react";
import * as Yup from "yup";
import { AuthContext } from "../../context/auth-context";
import CustomErrorMessage from "../ui/CustomErrorMessage";
import { Input } from "../ui/CustomInput";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AuthFormValues {
  username: string;
  password: string;
  confirm_password: string;
}

//
// Code duplication neccessary to reduce re-renders
//
const signupValidationSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .min(3, "Must be more than 3 characters")
    .max(16, "Must be 16 characters or less")
    .required("Required"),
  password: Yup.string()
    .trim()
    .min(6, "Must be at least 6 characters")
    .required("Required"),
  confirm_password: Yup.string()
    .trim()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Required"),
});
const loginValidationSchema = Yup.object().shape({
  username: Yup.string()
    .trim()
    .min(3, "Must be more than 3 characters")
    .max(16, "Must be 16 characters or less")
    .required("Required"),
  password: Yup.string()
    .trim()
    .min(6, "Must be at least 6 characters")
    .required("Required"),
  confirm_password: Yup.string().notRequired(),
});

const AuthForm = (props: { signup: Boolean; onChangeMode: VoidFunction }) => {
  const auth = useContext(AuthContext);
  const { sendRequest, isLoading } = useHttpClient();

  async function authSubmitHandler(values: AuthFormValues) {
    const { username, password } = values;
    const address = `${import.meta.env.VITE_SERVER_ADDRESS}/api/users/${
      props.signup ? "signup" : "login"
    }`;
    try {
      const { id, token } = await sendRequest(address, {}, "POST", {
        username,
        password,
      });
      auth.login(id, token);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Card className="w-[80%] md:w-1/2 shadow-md px-4 py-2 md:px-12 md:py-8">
      <CardHeader className="pb-4">
        <CardTitle>Teacher Authentication</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center py-2">
        <Formik
          initialValues={{
            username: "",
            password: "",
            confirm_password: "",
          }}
          validationSchema={
            props.signup ? signupValidationSchema : loginValidationSchema
          }
          onSubmit={authSubmitHandler}
        >
          <Form className="flex flex-col gap-2">
            {isLoading && <LoadingSpinner asOverlay />}
            <div>
              <Field as={Input} name="username" label="Username" />
              <CustomErrorMessage name="username" />
            </div>
            <div>
              <Field
                as={Input}
                name="password"
                label="Password"
                type="password"
              />
              <CustomErrorMessage name="password" />
            </div>
            {props.signup && (
              <div>
                <Field
                  as={Input}
                  name="confirm_password"
                  label="Confirm Password"
                  type="password"
                />
                <CustomErrorMessage name="confirm_password" />
              </div>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              variant={"default"}
              className="my-2"
            >
              {props.signup ? "Sign up" : "Log in"}
            </Button>
          </Form>
        </Formik>
        <Button onClick={props.onChangeMode} variant={"link"}>
          {props.signup ? "Log in instead" : "Sign up instead"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
