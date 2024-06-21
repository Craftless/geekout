import EditQuizComponent from "@/components/EditQuizComponent";
import CustomErrorMessage from "@/components/ui/CustomErrorMessage";
import { Input } from "@/components/ui/CustomInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PresentationPreview from "@/components/ui/PresentationPreview";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/auth-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Choice } from "@/lib/utils";
import { desktop } from "@/lib/utils";
import { deleteQuiz, fetchQuiz } from "@/utils/http";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useContext, useState } from "react";
import "react-json-pretty/themes/monikai.css";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

const ViewQuizPage = () => {
  const { qid } = useParams();
  const { toast } = useToast();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["quiz", { qid }],
    queryFn: ({ signal }) => fetchQuiz({ signal, auth, qid }),
  });
  const formatOptions = (options: Choice[]) => {
    const labels = ["A", "B", "C", "D"]; // Assuming there are always up to four options
    return options
      .map((option, index) => `${labels[index]}) ${option.choiceBody}`)
      .join(", ");
  };
  const { mutate: deleteMutate, isPending: isPendingDeletion } = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success!",
        description: "The quiz was successfully deleted.",
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: ["quizzes"],
        refetchType: "none",
      });
      navigate("..");
    },
  });

  async function deleteHandler() {
    deleteMutate({ auth, qid });
  }

  function submitHandler(
    values: { code: string },
    { setSubmitting }: FormikHelpers<{ code: string }>
  ) {
    navigate(`../host/lobby/${qid}`, { state: { roomCode: values.code } });
    setSubmitting(false);
  }

  const isDesktop = useMediaQuery(desktop);

  if (isPending) return <LoadingSpinner />;
  if (!data) return <p></p>;

  // TODO hopefully refactor this soon to reduce code duplication
  const editQuiz = isDesktop ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Edit Quiz</Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-[70%] w-[40%] min-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogDescription>
            Make changes to your quiz here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <EditQuizComponent
          qid={qid}
          onFinish={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Edit Quiz</Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90%] p-4">
        <DrawerHeader>
          <DrawerTitle>Edit Quiz</DrawerTitle>
          <DrawerDescription>
            Make changes to your quiz here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <Separator />
        <div className="overflow-auto p-4">
          <EditQuizComponent
            qid={qid}
            onFinish={() => {
              setOpen(false);
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );

  const hostRoom = isDesktop ? ( // TODO remove code duplication with HostLobby.tsx
    <Dialog>
      <DialogTrigger asChild>
        <Button>Host Room</Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-hidden max-h-[70%] w-[40%]">
        <DialogHeader>
          <DialogTitle>Host Room</DialogTitle>
          <DialogDescription>Enter a room code.</DialogDescription>
        </DialogHeader>
        <Separator />
        <Formik
          initialValues={{
            code: "",
          }}
          validationSchema={Yup.object().shape({
            code: Yup.string().trim().required("Code required."),
          })}
          onSubmit={submitHandler}
        >
          <Form className="flex flex-col gap-4">
            <div>
              <Field as={Input} name="code" placeholder="Room Code"></Field>
              <CustomErrorMessage name="code" />
            </div>
            <Button type="submit">Host</Button>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  ) : (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Host Room</Button>
      </SheetTrigger>
      <SheetContent className="max-h-[80%] px-4 rounded-b-[10px]" side="top">
        <SheetHeader className="pb-4">
          <SheetTitle>Host Room</SheetTitle>
          <SheetDescription>Enter a room code.</SheetDescription>
        </SheetHeader>
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
          <Form className="overflow-auto py-8 px-4 flex flex-col gap-4">
            <div>
              <Field
                as={Input}
                name="code"
                className="text-lg h-12"
                autoFocus
              />
              <CustomErrorMessage name="code" />
            </div>
            <Button type="submit" className="w-full">
              Host
            </Button>
          </Form>
        </Formik>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="p-3  flex flex-col items-center">
      {isPending && <LoadingSpinner asOverlay />}
      <div className="flex flex-col gap-3 my-5">
        <h1 className="text-3xl font-semibold ">
          {data.title} <span className="text-accent "></span>{" "}
        </h1>
        <p> {data.description || "No Description"}</p>
        <p className="text-xs text-accent font-semibold">
          {data.isPublic ? "Public" : "Private"}
        </p>
      </div>
      <PresentationPreview slides={data.slides} height={null} width="10/12" />
      <p>{data.slideCount}</p>{" "}
      {/* <div className="skeleton flex h-80 w-10/12 items-end justify-end rounded-sm bg-black/20 p-6">
      </div> */}
      <div className="my-5">{hostRoom}</div>
      <div className="w-full">
        <div className="overflow-x-auto">
          <h3 className="font-semibold">Questions Generated: </h3>
          <table className="table w-full">
            {/* head */}
            <thead>
              <tr>
                <th>Q#</th>
                <th>Question</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {data.questions.map((question, index) => (
                <tr key={question._id}>
                  <th>{index + 1}</th>
                  <td>{question.statement}</td>
                  <td>
                    {question.questionType == "MCQ" &&
                      question.choices &&
                      formatOptions(question.choices)}
                    {question.questionType == "FRQ" && (
                      <span className="italic">Free Response</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-4 py-6">
        {data.creator._id === auth.id && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[80%]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this quiz.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={deleteHandler}
                    variant={"destructive"}
                    loading={isPendingDeletion}
                    loadingText="Deleting..."
                  >
                    Confirm
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {editQuiz}
          </>
        )}
      </div>
      <Separator />
    </div>
  );
};

export default ViewQuizPage;
