import { columns } from "@/components/tables/responses/columns";
import PresentationPreview from "@/components/ui/PresentationPreview";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { GameContext } from "@/context/game-context";
import { useInit } from "@/hooks/use-init";
import { StudentResponse, StudentScores } from "@/lib/utils";
import { socket } from "@/socket";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TeacherQuizPage = () => {
  const game = useContext(GameContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  useInit(() => {
    socket.emitEvent("s_start_quiz", () => {
      socket.emitEvent("s_change_question", 0);
    });
    game.startQuiz();
  });

  useEffect(() => {
    if (!game.loadedQuiz) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Quiz not loaded!",
        duration: 2000,
      });
      navigate("/");
      return;
    }
    socket.addEvent("t_submit_answer", (response: StudentResponse) => {
      game.addStudentResponse(response);
    });
    socket.addEvent("t_delete_answer", (id: string) => {
      game.removeStudentResponse(id);
    });
    socket.addEvent("c_fetch_scores", (scores: StudentScores[]) => {
      game.setScores(scores);
    });
    socket.addEvent("t_update_response_status", (resp: StudentResponse) => {
      game.updateStudentResponse(resp);
    });
  }, [game, socket]);

  if (!game.loadedQuiz) {
    return <p>Loading</p>;
  }
  return (
    <div className="h-full p-4">
      <div>
        <PresentationPreview
          width="w-[320px]"
          height="w-[600px]"
          slides={game.loadedQuiz.slides}
          className="mx-auto my-5"
        />
      </div>
      <div className="flex w-full flex-row justify-center gap-4">
        <Button
          onClick={() => {
            game.changeSlide(game.currentSlide - 1, true);
          }}
        >
          Previous slide
        </Button>
        <Button
          onClick={() => {
            game.changeSlide(game.currentSlide + 1, true);
          }}
        >
          Next slide
        </Button>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={game.studentResponses} />
      </div>
    </div>
  );
};

export default TeacherQuizPage;
