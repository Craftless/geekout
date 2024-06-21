import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "@/context/auth-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { desktop } from "@/lib/utils";
import { createQuiz } from "@/utils/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CreateQuizForm, {
  CreateQuizFormValues,
} from "../../components/presentations/CreateQuizForm";

const CreateQuizPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success!",
        description: "The presentation was successfully created.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      navigate("..");
    },
  });

  async function createQuizSubmitHandler(values: CreateQuizFormValues) {
    mutate({ values, auth });
  }

  const isDesktop = useMediaQuery(desktop, { noSsr: true });
  const content = (
    <>
      <CardHeader>
        <CardTitle>
          <p>Create a new quiz</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CreateQuizForm
          isLoading={isPending}
          submitHandler={createQuizSubmitHandler}
        />
      </CardContent>
    </>
  );

  return (
    <div className="py-4">
      {isDesktop && (
        <div className="mx-auto w-full md:w-1/2 shadow-md px-12 py-8 md:rounded-xl flex flex-col justify-center">
          {content}
        </div>
      )}
      {!isDesktop && <div className="py-4 px-6">{content}</div>}
    </div>
  );
};

export default CreateQuizPage;
