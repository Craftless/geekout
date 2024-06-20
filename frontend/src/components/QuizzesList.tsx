import { QuizzesResponseData } from "@/pages/teacher/AllQuizzesListPage";
import QuizzesListItem from "./QuizzesListItem";
import { Skeleton } from "./ui/skeleton";

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
  <div className="flex flex-col gap-6 p-4 overflow-hidden h-fullh pb-0">
    <Skeleton className="m-auto w-[80%] md:w-1/2 min-h-64 p-4" />
    <Skeleton className="m-auto w-[80%] md:w-1/2 min-h-64 p-4" />
    <Skeleton className="m-auto w-[80%] md:w-1/2 min-h-64 p-4" />
  </div>
);
