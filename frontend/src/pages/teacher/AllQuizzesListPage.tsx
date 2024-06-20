import QuizzesList, { QuizzesListSkeleton } from "@/components/QuizzesList";
import { AuthContext } from "@/context/auth-context";
import { fetchQuizzes } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

export interface QuizzesResponseData {
  title: string;
  description: string;
  isPublic: boolean;
  creator: string;
  updatedAt: string;
  questionsLength: number;
  quizId: string;
}

const AllQuizzesListPage = () => {
  const auth = useContext(AuthContext);

  const { data, isPending } = useQuery({
    queryKey: ["quizzes"],
    queryFn: ({ signal }) => fetchQuizzes({ signal, auth }),
  });

  return (
    <div>
      {!isPending && !!data && <QuizzesList data={data} />}
      {isPending && <QuizzesListSkeleton />}
    </div>
  );
};

export default AllQuizzesListPage;
