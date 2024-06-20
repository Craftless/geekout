import { dateTransform } from "@/lib/utils";
import { QuizzesResponseData } from "@/pages/teacher/AllQuizzesListPage";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";

interface Props {
  data: QuizzesResponseData;
}

const QuizzesListItem = (props: Props) => {
  const {
    title,
    description,
    isPublic,
    creator,
    updatedAt,
    questionsLength,
    quizId,
  } = props.data;
  const navigate = useNavigate();
  return (
    <div>
      <Card
        className="m-auto w-[80%] md:w-1/2 h-64 p-4"
        onClick={() => {
          navigate(`/teacher/quizzes/view/${quizId}`);
        }}
      >
        <div className="w-full h-full flex flex-col justify-between">
          <div>
            <p>{creator}</p>
            <p>Updated: {dateTransform(updatedAt)}</p>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold">{title}</p>
            <p>{`${questionsLength} ${
              questionsLength > 1 ? "questions" : "question"
            }`}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizzesListItem;
