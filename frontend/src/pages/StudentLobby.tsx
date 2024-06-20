import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GameContext } from "@/context/game-context";
import { QuizResponseData } from "@/lib/utils";
import { socket } from "@/socket";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const StudentLobby = () => {
  const [students, setStudents] = useState<string[]>([]);
  const [roomCode, setRoomCode] = useState<string>("");
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
        }: {
          status: {
            value: boolean | null;
            message?: string;
          };
          students?: string[];
          qid?: string;
          quizData?: QuizResponseData;
        }) => {
          if (status.value) {
            if (!students || !qid || !quizData) {
              return;
            }
            console.log(students);
            setStudents(students);
            game.joinRoom(roomCode, qid, quizData);
            setRoomCode(roomCode);
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
  return (
    <div className="p-8 flex flex-col items-center">
      <p className="text-lg md:text-2xl font-bold">Room Code: {roomCode}</p>
      <div className="flex max-w-[80%] flex-wrap gap-6 justify-center py-8">
        {students.map((s) => (
          <Card key={s} className="px-16 py-8">
            <p>{s}</p>
          </Card>
        ))}
      </div>
      <Link to="/">Go back</Link>
    </div>
  );
};

export default StudentLobby;
