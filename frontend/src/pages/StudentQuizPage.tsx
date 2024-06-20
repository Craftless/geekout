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
    socket.addEvent("c_change_slide", (slideNumber: number) => {
      console.log("Client change slide", slideNumber);
      game.changeSlide(slideNumber);
    });
    console.log(
      "img"
      // new Buffer(game.slides[game.currentQuestion]).toString("base64")
    );
  }, [socket, game]);

  const currentQuestion = game.slideNumberToQuestion[game.currentSlide];
  return (
    <div className="w-full flex flex-col items-center h-screen justify-center">
      <img
        src={
          // "data:image/jpg;base-64," +
          URL.createObjectURL(new Blob([game.slides[game.currentSlide]]))
        }
        alt="image"
      />
      {currentQuestion && (
        <div className="md:w-[70%] md:min-w-[450px] w-[90%]">
          <p>
            Surprise Question!
            {/* Question {game.currentQuestion + 1}/{game.questions.length}: */}
          </p>
          <QuestionItem question={currentQuestion} roomCode={game.roomCode} />
        </div>
      )}
    </div>
  );
};

export default StudentQuizPage;
