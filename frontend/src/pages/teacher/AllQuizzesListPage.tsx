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
  slides: string;
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
    <div className="h-screen">
      <div className="hero h-[calc(40vh)] border-b-2 border-white/20 justify-start">
        <div className="hero-content text-left">
          <div className="">
            <h1 className="text-5xl font-bold">Get Presenting.</h1>
            <p className="py-6 text-wrap">
              Streamline your presentations with quizzes to engage your
              audience.
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
      {!isPending && !!data && <QuizzesList data={data} />}
      {isPending && <QuizzesListSkeleton />}
    </div>
  );
};

export default AllQuizzesListPage;
