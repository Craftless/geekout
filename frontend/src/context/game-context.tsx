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
  slides: Buffer[];
  addSlide: (slide: Buffer, page: number) => void;
  addStudent: (username: string) => void;
  removeStudent: (username: string) => void;
  startQuiz: () => string;
  changeQuestion: (questionNumber: number, teacher?: boolean) => void;
  changeSlide: (slideNumber: number, teacher?: boolean) => void;
  getQuestions: () => void;
  addStudentResponse: (response: StudentResponse) => void;
  removeStudentResponse: (id: string) => void;
  updateStudentResponse: (response: StudentResponse) => void;
  studentResponses: StudentResponse[];
  roomCode: string;
  loadedQuiz?: QuizResponseData;
  questions: Question[];
  currentQuestion: number;
  currentSlide: number;
}

export const GameContext = createContext<GameData>({
  quizId: "",
  roomCode: "",
  students: [],
  loadedQuiz: undefined,
  questions: [],
  currentQuestion: 0,
  currentSlide: 0,
  studentResponses: [],
  slides: [],
  addSlide: () => {},
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
  changeSlide: () => {},
});

const GameContextProvider = ({ children }: { children: ReactNode }) => {
  const [quizId, setQuizId] = useState("");
  const [students, setStudents] = useState<
    { username: string; score: number[] }[]
  >([]);
  const [loadedQuiz, setLoadedQuiz] = useState<QuizResponseData>();
  const [slides, setSlides] = useState<Buffer[]>([]);
  const [roomCode, setRoomCode] = useState("");
  // const [data, setData] = useState<QuizResponseData>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { sendRequest } = useHttpClient();
  const auth = useContext(AuthContext);
  const { toast } = useToast();
  const [studentResponses, setStudentResponses] = useState<StudentResponse[]>(
    []
  );

  const retrieveData = useCallback(
    async (qid: string) => {
      try {
        const { presentation }: { presentation: QuizResponseData } =
          await sendRequest(
            `${import.meta.env.VITE_SERVER_ADDRESS}/api/quizzes/${qid}`,
            {
              Authorization: "Bearer " + auth.token,
            }
          );
        return presentation;
      } catch (err) {}
    },
    [sendRequest, auth.token]
  );

  useEffect(() => {
    console.log("Cur", currentQuestion);
  }, [currentQuestion]);

  const createRoom = useCallback(
    async (code: string, quizId: string) => {
      console.log("here");
      console.log("Creating room");
      setRoomCode(code || (Math.random() * 1000).toString());
      console.log(code);
      setQuizId(quizId);
      const quiz = await retrieveData(quizId);
      if (!quiz) {
        alert("No quiz");
        return;
      }
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

  const changeSlide = useCallback(
    (slideNumber: number, teacher?: boolean) => {
      if (slideNumber < slides.length && slideNumber >= 0) {
        setCurrentSlide(slideNumber);
        if (teacher) socket.emitEvent("s_change_slide", slideNumber);
        console.log("Changing slide ", slideNumber);
      } else {
        console.log("Length: ", slides.length);
      }
    },
    [socket, slides.length]
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

  const addSlide = (slide: Buffer, page: number) => {
    setSlides((cur) => {
      const copy = [...cur];
      copy[page] = slide;
      return copy;
    });
  };

  return (
    <GameContext.Provider
      value={{
        quizId,
        roomCode,
        students,
        loadedQuiz,
        questions,
        currentQuestion,
        currentSlide,
        studentResponses,
        slides,
        addSlide,
        createRoom,
        getQuestions,
        joinRoom,
        addStudent,
        removeStudent,
        startQuiz,
        changeQuestion,
        changeSlide,
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
