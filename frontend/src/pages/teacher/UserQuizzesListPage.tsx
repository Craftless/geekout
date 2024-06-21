import QuizzesList, { QuizzesListSkeleton } from "@/components/QuizzesList";
import { AuthContext } from "@/context/auth-context";
import { fetchQuizzes } from "@/utils/http";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { useParams } from "react-router-dom";

const UserQuizzesListPage = () => {
  const auth = useContext(AuthContext);
  const { uid } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ["quizzes", { uid }],
    queryFn: ({ signal }) => fetchQuizzes({ signal, auth, uid }),
  });

  return (
    <div className="h-fullh">
      {!isPending && !!data && <QuizzesList data={data} />}
      {isPending && <QuizzesListSkeleton />}
    </div>
  );
};

export default UserQuizzesListPage;
