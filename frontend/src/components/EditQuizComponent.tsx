import { AuthContext } from "@/context/auth-context";

import { QuizResponseData } from "@/lib/utils";
import { editQuiz, fetchQuiz } from "@/utils/http";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateQuizForm, {
  CreateQuizFormValues,
} from "./presentations/CreateQuizForm";
import { useToast } from "./ui/use-toast";

const EditQuizComponent = ({
  qid,
  onFinish,
}: {
  qid?: string;
  onFinish: VoidFunction;
}) => {
  const auth = useContext(AuthContext);
  const [formData, setFormData] = useState<CreateQuizFormValues>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: quizData, isPending } = useQuery<QuizResponseData>({
    queryKey: ["quiz", { qid }],
    queryFn: ({ signal }) => fetchQuiz({ signal, auth, qid }),
  });

  const { mutate, isPending: isPendingEdit } = useMutation({
    mutationFn: editQuiz,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", { qid }] });
    },
    onMutate: async (data) => {
      const newQuiz = data.values;
      const oldData = queryClient.getQueryData<QuizResponseData>([
        "quiz",
        { qid },
      ]);
      if (!oldData) throw new Error("No old data.");
      const newData: QuizResponseData = {
        ...oldData,
        ...newQuiz,
        isPublic: newQuiz.isPublic === "true",
      };
      console.log(newData);
      await queryClient.cancelQueries({ queryKey: ["quiz", { qid }] });
      queryClient.setQueryData(["quiz", { qid }], newData);
      onFinish();
      return { oldData };
    },
    onError: (_err, _data, context) => {
      if (!context?.oldData) {
        toast({
          variant: "destructive",
          title: "An error occured.",
          description: "Old data not present for this quiz.",
          duration: 3000,
        });
        navigate("/teacher");
        return;
      }
      queryClient.setQueryData(["quiz", { qid }], context.oldData);
    },
  });

  useEffect(() => {
    if (!quizData) return;
    const { questions, isPublic, description, title, _id, slides } = quizData;
    const newFormData = {
      title,
      description: description || "",
      slides,
      isPublic: String(isPublic),
      questions,
      _id,
    };
    setFormData(newFormData);
  }, [quizData]);

  async function editQuizSubmitHandler(values: CreateQuizFormValues) {
    mutate({ auth, values, formData, qid });
  }

  return (
    <div className="py-4">
      {isPending && "Loading..."}
      {!isPending && (
        <>
          {/* <ErrorModal error={error} onClear={clearError} /> */}
          {formData && (
            <CreateQuizForm
              isLoading={isPendingEdit}
              submitHandler={editQuizSubmitHandler}
              initialFormValues={formData}
              submitButtonText="Save Changes"
            />
          )}
        </>
      )}
    </div>
  );
};

export default EditQuizComponent;
