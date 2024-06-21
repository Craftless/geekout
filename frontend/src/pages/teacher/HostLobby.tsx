import CustomErrorMessage from "@/components/ui/CustomErrorMessage";
import { Input } from "@/components/ui/CustomInput";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { GameContext } from "@/context/game-context";
import { socket } from "@/socket";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

const HostLobby = () => {
  const { qid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(location.state || undefined);

  const game = useContext(GameContext);

  useEffect(() => {
    // keep in mind this runs twice in dev
    if (!qid) {
      navigate("/");
      return;
    }
    if (!state) {
      setOpen(true);
      return;
    }
    const onConnect = () => {
      socket.emitEvent(
        "check_create_room",
        state.roomCode,
        async (success: boolean) => {
          if (!success) {
            toast({
              variant: "destructive",
              title: "Error!",
              description: "Room already exists",
              duration: 2000,
            });
            return;
          }
          await game.createRoom(state.roomCode, qid);
        }
      );
      socket.addEvent("student_join", (studentData: { username: string }) => {
        game.addStudent(studentData.username);
      });
      socket.addEvent("student_leave", (studentData: { username: string }) => {
        console.log(studentData.username + " left!");
        game.removeStudent(studentData.username);
      });
      socket.addEvent("slides", (image, page) => {
        game.addSlide(image, page);
        console.log(image);
      });
    };

    socket.connect(onConnect);
  }, [game.createRoom, game.addStudent, game.removeStudent, state]);

  function submitHandler(
    values: { code: string },
    { setSubmitting }: FormikHelpers<{ code: string }>
  ) {
    setState({ roomCode: values.code });
    setSubmitting(false);
  }

  if (!state)
    return (
      // TODO remove code duplication
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button>Host Room</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="overflow-y-scroll max-h-[70%] min-w-[40%]">
          <AlertDialogHeader>
            <AlertDialogTitle>Host Room</AlertDialogTitle>
            <AlertDialogDescription>Enter a room code.</AlertDialogDescription>
          </AlertDialogHeader>
          <Separator />
          <Formik
            initialValues={{
              code: "",
            }}
            validationSchema={Yup.object().shape({
              code: Yup.string().trim().required("Code required"),
            })}
            onSubmit={submitHandler}
          >
            <Form className="flex flex-col gap-4">
              <div>
                <Field as={Input} name="code"></Field>
                <CustomErrorMessage name="code" />
              </div>
              <Button type="submit">Host</Button>
            </Form>
          </Formik>
        </AlertDialogContent>
      </AlertDialog>
    );

  return (
    <div className="p-8 flex flex-col items-center">
      <div className="gap-3 mb-6">
        {" "}
        <h1 className="text-3xl font-semibold">Join Today's Lesson.</h1>
        <p className="text-lg md:text-2xl font-bold my-2">
          Room Code: <span className="text-yellow-400">{game.roomCode}</span>
        </p>
      </div>

      <div className="skeleton flex h-80 w-10/12 items-end justify-end rounded-sm bg-black/20 p-6">
        <p> 20</p>{" "}
      </div>
      <p className="text-xs opacity-20">Quiz ID: {game.quizId}</p>
      <div className="my-6">
        <button
          className="btn btn-primary btn-wide"
          onClick={() => {
            navigate("/teacher/host");
          }}
        >
          Start Quiz
        </button>
      </div>

      <div className="w-full text-start font-semibold text-xl my-3 border-b-2 border-white/20 py-3">
        {" "}
        Participants Joined: {game.students.length}{" "}
      </div>
      <div className="flex max-w-[80%] flex-wrap gap-6 justify-center py-8">
        {game.students.map((s) => (
          <Card key={s.student} className="px-16 py-8">
            <p>{s.student}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HostLobby;
