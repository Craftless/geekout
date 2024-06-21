import QuestionItem from "@/components/QuestionItem";
import { GameContext } from "@/context/game-context";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import Leaderboard from "@/components/ui/Leaderboard";
import { Question, StudentScores } from "@/lib/utils";

const StudentQuizPage = () => {
  const game = useContext(GameContext);
  const [showAlert, setShowAlert] = useState(false);
  const [progress, setProgress] = useState(100);
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(15);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(
    undefined
  );

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

  useEffect(() => {
    setCurrentQuestion(game.slideNumberToQuestion[game.currentSlide]);
    if (currentQuestion) {
      setShowAlert(true);
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress > 0) return prevProgress - 2.5; // Decrement progress to reach 0 in 4 seconds
          clearInterval(interval);
          return prevProgress;
        });
      }, 100); // Update progress every 100ms

      setTimeout(() => {
        setShowAlert(false);
        clearInterval(interval);
        (
          document.getElementById("my_modal_1") as HTMLDialogElement
        ).showModal();
        setShowModal(true);
        setTimer(15);
      }, 4000); // Wait 4 seconds, then hide alert and show modal
    }
  });

  useEffect(() => {
    //this is the modal timeout
    let countdown: string | number | NodeJS.Timeout | undefined;
    if (showModal && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            (
              document.getElementById("my_modal_1") as HTMLDialogElement
            ).close();
            setShowModal(false);
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdown);
  }, [showModal, timer]);

  if (!game.quizId) return <Navigate to="/lobby" />;

  return (
    <Leaderboard>
      <div className="w-full flex flex-col items-center h-screen justify-center">
        <img
          src={URL.createObjectURL(new Blob([game.slides[game.currentSlide]]))}
          alt="image"
        />

        {showAlert && (
          <div className="absolute bottom-0 -translate-y-20 transition-transform">
            <div role="alert" className="alert flex flex-col">
              <progress
                className="progress w-full transition-all"
                value={progress}
                max="100"
              ></progress>
              <span>A question is about to appear. Get Ready!</span>
            </div>
          </div>
        )}

        <dialog id="my_modal_1" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <div className="mb-5 flex justify-between h-full w-full">
              <div>
                {" "}
                <QuestionItem
                  question={currentQuestion}
                  roomCode={game.roomCode}
                />
              </div>
              <div
                className="radial-progress text-primary"
                style={{ "--value": (timer / 15) * 100 }}
                role="progressbar"
              >
                {timer}s
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
        {/* {currentQuestion && (
          <div className="md:w-[70%] md:min-w-[450px] w-[90%]">
            <p>Surprise Question!</p>
            <QuestionItem question={currentQuestion} roomCode={game.roomCode} />
          </div>
        )} */}
      </div>
    </Leaderboard>
  );
};

export default StudentQuizPage;
