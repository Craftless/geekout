import QuestionItem from "@/components/QuestionItem";
import { GameContext } from "@/context/game-context";
import { socket } from "@/socket";
import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";

import { ArrowUpNarrowWide } from "lucide-react";

const StudentQuizPage = () => {
  const game = useContext(GameContext);
  if (!game.quizId) return <Navigate to="/lobby" />;
  const scoredArray = game.students.map((student) => {
    const totalScore = student.score.reduce((sum, score) => sum + score, 0);

    return { ...student, totalScore };
  });

  scoredArray.sort((a, b) => a.totalScore - b.totalScore);

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
    <div className="drawer drawer-end">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer"
          className="absolute right-10 top-30 btn btn-square drawer-button"
        >
          <ArrowUpNarrowWide size={24} />
        </label>

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
              <QuestionItem
                question={currentQuestion}
                roomCode={game.roomCode}
              />
            </div>
          )}
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="p-4 w-80 min-h-full bg-base-200 text-base-content  flex flex-col items-start">
          <h1 className="font-bold text-xl">Leaderboard</h1>
          <div className="divider"></div>

          <div>
            {scoredArray.map((student) => (
              <div key={student.username} className="card w-full bg-white/10">
                <div
                  className="card-body justify-between"
                  key={student.username}
                >
                  <div>
                    {" "}
                    <p>{student.username}</p>
                  </div>
                  <div>
                    {" "}
                    <p>{student.totalScore} points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizPage;
