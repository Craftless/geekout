import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GameContext } from "@/context/game-context";
import { QuizResponseData } from "@/lib/utils";
import { socket } from "@/socket";
import { ArrowUpNarrowWide } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const StudentLobby = () => {
  const [students, setStudents] = useState<string[]>([]);
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
            console.log(students);
            setStudents(students);
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
        setStudents((prev) => [...prev, studentData.username]);
      });
      socket.addEvent("student_leave", (studentData: { username: string }) => {
        setStudents((prev) => prev.filter((s) => s !== studentData.username));
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

  const scoredArray = game.students.map((student) => {
    const totalScore = student.score.reduce((sum, score) => sum + score, 0);

    return { ...student, totalScore };
  });

  scoredArray.sort((a, b) => a.totalScore - b.totalScore);

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

        <div className="p-8 flex flex-col items-center h-screen">
          <p className="text-2xl font-bold">You're in!</p>
          <div className="flex max-w-[80%] flex-wrap gap-6 justify-center py-8">
            {students.map((s) => (
              <Card key={s} className="px-16 py-8">
                <p>{s}</p>
              </Card>
            ))}
          </div>

          <Link to="/">
            {" "}
            <button className="btn btn-outline">Leave</button>
          </Link>
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

export default StudentLobby;
