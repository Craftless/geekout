import Leaderboard from "@/components/ui/Leaderboard";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GameContext } from "@/context/game-context";
import { QuizResponseData } from "@/lib/utils";
import { socket } from "@/socket";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const StudentLobby = () => {
  const game = useContext(GameContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    const onConnect = () => {
      socket.emitEvent(
        "join_room",
        {
          room: roomCode,
          username,
        },
        ({
          status,
          students,
          qid,
          quizData,
          numOfSlides,
        }: {
          status: {
            value: boolean | null;
            message?: string;
          };
          students?: string[];
          qid?: string;
          quizData?: QuizResponseData;
          numOfSlides: number;
        }) => {
          if (status.value) {
            if (!students || !qid || !quizData) {
              return;
            }
            game.setStudentsAndScores(students);
            game.joinRoom(roomCode, qid, quizData, numOfSlides);
          } else {
            if (status.value !== null) {
              toast({
                variant: "destructive",
                title: "Error!",
                description: status.message || "An error occurred",
                duration: 2000,
              });
              navigate("/");
            }
          }
        }
      );
      socket.addEvent("student_join", (studentData: { username: string }) => {
        game.addStudent(studentData.username);
      });
      socket.addEvent("student_leave", (studentData: { username: string }) => {
        game.removeStudent(studentData.username);
      });
      socket.addEvent("remove_room", () => {
        navigate("/");
      });
      socket.addEvent("c_start_quiz", () => {
        navigate("/start");
      });
      socket.addEvent("slides", (image, page) => {
        game.addSlide(image, page);
        console.log(image);
      });
    };

    const data = localStorage.getItem("studentJoinData");
    if (!data) return;
    const { roomCode, username } = JSON.parse(data);
    socket.connect(onConnect);
  }, [game, socket]);

  return (
    <Leaderboard>
      <div className="p-8 flex flex-col items-center h-screen">
        <p className="text-2xl font-bold">You're in!</p>
        <div className="flex max-w-[80%] flex-wrap gap-6 justify-center py-8">
          {game.students.map((s) => (
            <Card key={s.student} className="px-16 py-8">
              <p>{s.student}</p>
            </Card>
          ))}
        </div>

        <Link to="/">
          {" "}
          <button className="btn btn-outline">Leave</button>
        </Link>
      </div>
    </Leaderboard>
  );
};

export default StudentLobby;
