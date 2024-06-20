import { CreateQuizFormValues } from "@/components/presentations/CreateQuizForm";
import { toast } from "@/components/ui/use-toast";
import { IAuthContext } from "@/context/auth-context";
import { QuizResponseData, findDeleted } from "@/lib/utils";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import axios, { AxiosError, GenericAbortSignal } from "axios";
import pick from "lodash.pick";

type GETRequestFn = {
  signal: GenericAbortSignal;
  auth: IAuthContext;
};

type NonGETRequestFn = {
  auth: IAuthContext;
};

export async function editQuiz({
  auth,
  values,
  formData,
  qid,
}: NonGETRequestFn & {
  values: CreateQuizFormValues;
  formData?: CreateQuizFormValues;
  qid?: string;
}) {
  if (!qid) throw new Error("Quiz does not exist");
  if (!formData) throw new Error("Something went wrong!");
  const { questions, ...quizInfo } = values;
  const cleanedQuestions = [];

  for (const question of questions) {
    if (question.questionType === "MCQ") delete question.correctAnswer;
    if (question.questionType === "FRQ") delete question.choices;
    cleanedQuestions.push(question);
  }

  const deleted = findDeleted(formData!.questions, questions);

  deleted.forEach((del) => {
    cleanedQuestions.push({
      _id: `delete ${del}`,
    });
  });

  const reqBody = {
    ...quizInfo,
    questions: cleanedQuestions,
  };

  await sendRequest({
    url: `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/${qid}`,
    headers: {
      Authorization: "Bearer " + auth.token,
    },
    method: "PATCH",
    data: reqBody,
  });
}

export async function deleteQuiz({
  auth,
  qid,
}: NonGETRequestFn & { qid?: string }) {
  if (!qid) throw new Error("Quiz does not exist!");
  await sendRequest({
    url: `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/${qid}`,
    headers: {
      Authorization: "Bearer " + auth.token,
    },
    method: "DELETE",
  });
}

export async function AI({ auth, file }: NonGETRequestFn & { file: File }) {
  if (!file) throw new Error("File does not exist!");
  const response = await sendRequest({
    url: `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/ai`,
    headers: {
      Authorization: "Bearer " + auth.token,
    },
    method: "POST",
  });
  console.log(response);
}

export async function fetchQuiz({
  signal,
  auth,
  qid,
}: GETRequestFn & { qid?: string }) {
  if (!qid) throw new Error("Quiz does not exist!");
  const { presentation } = await sendRequest({
    url: `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/${qid}`,
    headers: {
      Authorization: "Bearer " + auth.token,
    },
    signal,
  });
  return presentation as QuizResponseData;
}

export async function createQuiz({
  values,
  auth,
}: {
  values: CreateQuizFormValues;
  auth: IAuthContext;
}) {
  const { questions, slides, ...quizInfo } = values;
  const cleanedQuestions = [];

  for (const question of questions) {
    if (question.questionType === "MCQ") delete question.correctAnswer;
    if (question.questionType === "FRQ") delete question.choices;
    cleanedQuestions.push(question);
  }

  const reqBody = {
    ...quizInfo,
    questions: cleanedQuestions,
  };

  const formData = new FormData();
  formData.append("slides", slides);
  formData.append("reqBody", JSON.stringify(reqBody));

  await sendRequest({
    url: `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/`,
    headers: {
      Authorization: "Bearer " + auth.token,
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    data: formData,
  });
}

export async function fetchQuizzes({
  auth,
  signal,
  uid,
}: GETRequestFn & {
  uid?: string;
}) {
  const respData: ResponseData = await sendRequest({
    url: `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/${
      uid ? `user/${uid}` : "all"
    }`,
    signal,
    headers: {
      Authorization: "Bearer " + auth.token,
    },
  });
  const quizzes = respData.presentations.map((quiz) => {
    const picked: any = pick(
      quiz,
      "title",
      "description",
      "isPublic",
      "creator",
      "updatedAt",
      "questions",
      "_id"
    );
    picked.questionsLength = picked.questions.length;
    picked.quizId = picked._id;
    picked._id = undefined;
    picked.questions = undefined;
    return picked;
  });
  return quizzes;
}

interface ResponseData {
  presentations: [
    {
      __v: number;
      _id: string;
      title: string;
      description: string;
      isPublic: boolean;
      creator: string;
      questions: [string];
      createdAt: string;
      updatedAt: string;
    }
  ];
}

const sendRequest = async (data: {
  url: string;
  signal?: GenericAbortSignal;
  headers?: any;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  data?: any;
}) => {
  if (!data.method) data.method = "GET";
  const response = await axios({ ...data });
  return response.data;
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err, _query) => {
      let errorCode, errorMessage;
      if (axios.isAxiosError(err)) {
        const receivedError = err as AxiosError;
        if (receivedError.message === "canceled") throw err;
        errorCode = receivedError.code;
        errorMessage =
          (receivedError.response?.data as any)?.message ||
          receivedError.message;
      }
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong. " + errorCode,
        description: errorMessage || "There was a problem with your request.",
        duration: 3000,
      });
      if (errorMessage?.includes("log in again")) window.location.reload();
    },
  }),
});
