import { socket } from "@/socket";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import LoadingSpinner from "./ui/LoadingSpinner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

let handler: NodeJS.Timeout | null;

const JoinRoomForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const { toast } = useToast();

  const onConnect = (room: string, username: string) => {
    socket.emitEvent(
      "check_room",
      {
        room,
      },
      ({ canJoin }: { canJoin: boolean }) => {
        if (!canJoin) {
          socket.close();
          toast({
            variant: "destructive",
            title: "Joining the room failed.",
            description:
              "This may occur if the room does not exist, or if the host has started a quiz in the room.",
            duration: 3000,
          });
          setIsLoading(false);
          return;
        }
        localStorage.setItem(
          "studentJoinData",
          JSON.stringify({ roomCode: room, username })
        ); // this is how kahoot does it - allows user to rejoin on refresh
        setIsLoading(false);
        navigate("/lobby");
      }
    );
  };

  function formSubmitHandler({
    room,
    username,
  }: {
    room: string;
    username: string;
  }) {
    if (canSubmit) {
      setCanSubmit(false);
      socket.connect(() => onConnect(room, username));
    } else {
      toast({
        variant: "destructive",
        title: "Joining the room failed",
        description: "Slow down! Please wait a moment before trying again.",
        duration: 1000,
      });
    }
    if (!handler) {
      handler = setTimeout(() => {
        if (!handler) return;
        clearTimeout(handler);
        handler = null;
        setCanSubmit(true);
      }, 1000);
    }
    console.log(handler);
  }

  useEffect(() => {
    socket.close();
  }, []);

  return (
    <Card className="w-[80%] md:w-1/3 shadow-md px-6 py-4">
      <CardHeader>
        <CardTitle>Join a room</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center py-2">
        <Formik
          initialValues={{
            room: "",
            username: "",
          }}
          validationSchema={Yup.object().shape({
            room: Yup.string().trim().required("Required"),
            username: Yup.string().trim().required("Required"),
          })}
          onSubmit={formSubmitHandler}
        >
          <Form className="flex flex-col gap-2">
            {isLoading && <LoadingSpinner asOverlay />}
            <div>
              <Field
                as={Input}
                name="room"
                className="text-lg h-12"
                placeholder="Game Code"
              />
              <Field
                as={Input}
                name="username"
                className="text-lg h-12"
                placeholder="Username"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              variant={"default"}
              className="my-2"
            >
              Join Room
            </Button>
          </Form>
        </Formik>
      </CardContent>
    </Card>
  );
};

export default JoinRoomForm;
