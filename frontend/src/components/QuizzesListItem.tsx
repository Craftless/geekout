import { dateTransform } from "@/lib/utils";
import { QuizzesResponseData } from "@/pages/teacher/AllQuizzesListPage";
import { useNavigate } from "react-router-dom";
import PresentationPreview from "./ui/PresentationPreview";

interface Props {
  data: QuizzesResponseData;
}

const QuizzesListItem = (props: Props) => {
  const {
    title,
    // description,
    // isPublic,
    // creator,
    slides,
    updatedAt,
    questionsLength,
    quizId,
  } = props.data;
  const navigate = useNavigate();
  return (
    <div className="flex border-b-2 border-white/20 py-2 justify-between items-center">
      <div className="flex justify-center">
        <PresentationPreview slides={slides} imgHeight={128} imgWidth={256} />
        <div className="flex flex-col text-left justify-center px-5">
          <p className="text-2xl font-semibold">{title}</p>
          <p>Updated: {dateTransform(updatedAt)}</p>
          <p>{`${questionsLength} ${
            questionsLength > 1 ? "questions" : "question"
          }`}</p>
        </div>
      </div>
      <div className="pr-5 italic">
        <button
          className="btn btn-primary"
          onClick={() => {
            navigate(`/teacher/quizzes/view/${quizId}`);
          }}
        >
          View Deck
        </button>
      </div>
    </div>
  );
};

export default QuizzesListItem;
