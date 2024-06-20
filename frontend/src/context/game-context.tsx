import { useToast } from "@/components/ui/use-toast";
import { useHttpClient } from "@/hooks/http-hook";
import { Question, QuizResponseData, StudentResponse } from "@/lib/utils";
import { socket } from "@/socket";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./auth-context";

interface GameData {
  quizId: string;
  students: { username: string; score: number[] }[];
  createRoom: (code: string, quizId: string) => Promise<void>;
  joinRoom: (
    code: string,
    quizId: string,
    quiz: QuizResponseData
  ) => Promise<void>;
  addStudent: (username: string) => void;
  removeStudent: (username: string) => void;
  startQuiz: () => string;
  changeQuestion: (questionNumber: number, teacher?: boolean) => void;
  getQuestions: () => void;
  addStudentResponse: (response: StudentResponse) => void;
  removeStudentResponse: (id: string) => void;
  updateStudentResponse: (response: StudentResponse) => void;
  studentResponses: StudentResponse[];
  roomCode: string;
  loadedQuiz?: QuizResponseData;
  questions: Question[];
  currentQuestion: number;
}

export const GameContext = createContext<GameData>({
  quizId: "",
  roomCode: "",
  students: [],
  loadedQuiz: undefined,
  questions: [],
  currentQuestion: 0,
  studentResponses: [],
  createRoom: async () => {},
  getQuestions: () => {},
  joinRoom: async () => {},
  addStudent: () => {},
  removeStudent: () => {},
  startQuiz: () => "",
  addStudentResponse: () => {},
  removeStudentResponse: () => {},
  updateStudentResponse: () => {},
  changeQuestion: () => {},
});

const GameContextProvider = ({ children }: { children: ReactNode }) => {
  const [quizId, setQuizId] = useState("");
  const [students, setStudents] = useState<
    { username: string; score: number[] }[]
  >([]);
  const [loadedQuiz, setLoadedQuiz] = useState<QuizResponseData>();
  const [roomCode, setRoomCode] = useState("");
  // const [data, setData] = useState<QuizResponseData>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { sendRequest } = useHttpClient();
  const auth = useContext(AuthContext);
  const { toast } = useToast();
  const [studentResponses, setStudentResponses] = useState<StudentResponse[]>(
    []
  );

  const retrieveData = useCallback(
    async (qid: string) => {
      try {
        const { quiz }: { quiz: QuizResponseData } = await sendRequest(
          `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/${qid}`,
          {
            Authorization: "Bearer " + auth.token,
          }
        );
        return quiz;
      } catch (err) {}
    },
    [sendRequest, auth.token]
  );

  useEffect(() => {
    console.log("Cur", currentQuestion);
  }, [currentQuestion]);

  const createRoom = useCallback(
    async (code: string, quizId: string) => {
      console.log("Creating room");
      setRoomCode(code || (Math.random() * 1000).toString());
      console.log(code);
      setQuizId(quizId);
      const quiz = await retrieveData(quizId);
      if (!quiz) return;
      setLoadedQuiz(quiz);
      setQuestions(quiz.questions);
      socket.emitEvent(
        "create_room",
        code,
        quizId,
        quiz,
        async ({ room }: { room: string | null }) => {
          if (!room) {
            toast({
              variant: "destructive",
              title: "Error!",
              description: "An error occurred while creating the room.",
              duration: 2000,
            });
            return;
          }
        }
      );
    },
    [retrieveData, socket]
  );

  const joinRoom = useCallback(
    async (code: string, quizId: string, quiz: QuizResponseData) => {
      console.log("Joining room");
      setRoomCode(code || (Math.random() * 1000).toString());
      setQuizId(quizId);
      setLoadedQuiz(quiz);
      setQuestions(quiz.questions);
    },
    []
  );

  const addStudent = useCallback((username: string) => {
    setStudents((prev) => [...prev, { username, score: [] }]);
  }, []);

  const removeStudent = useCallback((username: string) => {
    setStudents((prev) => prev.filter((s) => s.username !== username));
  }, []);

  const startQuiz = useCallback(() => {
    if (!loadedQuiz) return "Quiz not loaded";
    if (!questions) return "Questions not loaded";
    setCurrentQuestion(0);
    return "Success!";
  }, [loadedQuiz, questions]);

  const getQuestions = useCallback(() => {
    console.log("L" + questions.length);
  }, [questions]);

  const changeQuestion = useCallback(
    (questionNumber: number, teacher?: boolean) => {
      if (questionNumber < questions.length && questionNumber >= 0) {
        setCurrentQuestion(questionNumber);
        if (teacher) socket.emitEvent("s_change_question", questionNumber);
        console.log("Changing question ", questionNumber);
      } else {
        console.log("Length: ", questions.length);
      }
    },
    [socket, questions.length]
  );

  const addStudentResponse = useCallback((response: StudentResponse) => {
    setStudentResponses((cur) => [...cur, response]);
  }, []);

  const updateStudentResponse = (response: StudentResponse) => {
    setStudentResponses((cur) => {
      const idx = cur.findIndex((val) => val.id === response.id);
      if (idx !== -1) cur[idx] = response;
      return [...cur];
    });
  };

  const removeStudentResponse = useCallback((id: string) => {
    setStudentResponses((cur) => cur.filter((v) => v.id !== id));
  }, []);

  return (
    <GameContext.Provider
      value={{
        quizId,
        roomCode,
        students,
        loadedQuiz,
        questions,
        currentQuestion,
        studentResponses,
        createRoom,
        getQuestions,
        joinRoom,
        addStudent,
        removeStudent,
        startQuiz,
        changeQuestion,
        addStudentResponse,
        removeStudentResponse,
        updateStudentResponse,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContextProvider;
