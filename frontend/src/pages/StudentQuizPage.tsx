import QuestionItem from "@/components/QuestionItem";
import { GameContext } from "@/context/game-context";
import { socket } from "@/socket";
import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

const StudentQuizPage = () => {
  const game = useContext(GameContext);
  if (!game.quizId) return <Navigate to="/lobby" />;

  useEffect(() => {
    socket.addEvent("c_change_question", (questionNumber: number) => {
      console.log("Client change qn", questionNumber);
      game.changeQuestion(questionNumber);
    });
  }, [socket, game]);
  return (
    <div className="w-full flex flex-col items-center h-screen justify-center">
      <div className="md:w-[70%] md:min-w-[450px] w-[90%]">
        <p>
          Question {game.currentQuestion + 1}/{game.questions.length}:
        </p>
        <QuestionItem
          question={game.questions[game.currentQuestion]}
          roomCode={game.roomCode}
        />
      </div>
    </div>
  );
};

export default StudentQuizPage;
