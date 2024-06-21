import QuestionItem from "@/components/QuestionItem";
import { GameContext } from "@/context/game-context";
import { socket } from "@/socket";
import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

import Leaderboard from "@/components/ui/Leaderboard";
import { StudentScores } from "@/lib/utils";

const StudentQuizPage = () => {
  const game = useContext(GameContext);
  if (!game.quizId) return <Navigate to="/lobby" />;

  useEffect(() => {
    socket.addEvent("c_change_question", (questionNumber: number) => {
      console.log("Client change qn", questionNumber);
      game.changeQuestion(questionNumber);
    });
    socket.addEvent("c_change_slide", (slideNumber: number) => {
      console.log("Client change slide", slideNumber);
      game.changeSlide(slideNumber);
    });
    socket.addEvent("c_fetch_scores", (scores: StudentScores[]) => {
      game.setScores(scores);
    });
    console.log("img");
  }, [socket, game]);

  const currentQuestion = game.slideNumberToQuestion[game.currentSlide];
  return (
    <Leaderboard>
      <div className="w-full flex flex-col items-center h-screen justify-center">
        <img
          src={URL.createObjectURL(new Blob([game.slides[game.currentSlide]]))}
          alt="image"
        />
        {currentQuestion && (
          <div className="md:w-[70%] md:min-w-[450px] w-[90%]">
            <p>Surprise Question!</p>
            <QuestionItem question={currentQuestion} roomCode={game.roomCode} />
          </div>
        )}
      </div>
    </Leaderboard>
  );
};

export default StudentQuizPage;
