import { QuizzesResponseData } from "@/pages/teacher/AllQuizzesListPage";
import QuizzesListItem from "./QuizzesListItem";
// import { Skeleton } from "./ui/skeleton";
import { QuizListSkeleton } from "./ui/quizListSkeleton";

interface Props {
  data: QuizzesResponseData[];
}

const QuizzesList = (props: Props) => {
  return (
    <div className="flex flex-col gap-6 py-4">
      {props.data.map((data) => (
        <QuizzesListItem key={data.quizId} data={data} />
      ))}
    </div>
  );
};

export default QuizzesList;

export const QuizzesListSkeleton = () => (
  <div className="flex flex-col gap-6 p-4 overflow-hidden h-full pb-0">
    <QuizListSkeleton />
    <QuizListSkeleton />
    <QuizListSkeleton />
  </div>
);
