import { Socket } from "socket.io";

type StudentScores = { student: string; scoresByQuestion: number[] };

interface RoomInfo {
  hostId: string;
  students: string[]; // usernames
  quizId: string;
  quizData: QuizResponseData;
  totalQuestions: number;
  currentQuestion: number;
  currentSlide: number;
  started: boolean;
  answers: StudentResponse[][]; // question, answer
  scores: StudentScores[];
}

const rooms = new Map<string, RoomInfo>();

export function getRooms() {
  return rooms;
}

export function createRoom(
  roomCode: string,
  quizId: string,
  quizData: QuizResponseData,
  hostSocket: Socket,
  totalQuestions: number
) {
  rooms.set(roomCode, {
    hostId: hostSocket.id,
    students: [],
    quizId,
    quizData: quizData,
    totalQuestions,
    currentQuestion: 0,
    currentSlide: 0,
    started: false,
    answers: Array(totalQuestions).fill([]),
    scores: [],
  });
}

export function removeRoom(roomCode: string) {
  rooms.delete(roomCode);
}

export function joinRoom(roomCode: string, username: string, socket: Socket) {
  const room = rooms.get(roomCode);
  if (room) {
    room.students.push(username);
  }
}

export function updateResponseStatusAndScore(
  roomCode: string,
  response: StudentResponse,
  status: StudentResponseStatus
) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const resIdx = room.answers[room.currentQuestion].findIndex(
    (val) => val.id === response.id
  );
  if (resIdx === -1) return;
  room.answers[room.currentQuestion][resIdx].status = status;
  const scoresIdx = room.scores.findIndex(
    (val) => val.student === response.username
  );
  if (scoresIdx === -1) return;
  console.log(response.status);
  room.scores[scoresIdx].scoresByQuestion[room.currentQuestion] =
    status === "Correct" ? 1000 : 0;
}

export function fetchScores(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  return room.scores;
}

// export function rejoinRoom(username: string, socket: Socket) {
//   const connectedRoom = usernameMap.get(username);
//   if (!connectedRoom) return;
//   const room = rooms.get(connectedRoom);
//   if (room) room.students;
// }

export function removeStudentFromRoom(roomCode: string, username: string) {
  const room = rooms.get(roomCode);
  if (room) {
    room.students = room.students.filter((s) => s !== username);
  }
}

export function submitAnswer(
  roomCode: string,
  username: string,
  answer: string,
  id: string
) {
  const room = rooms.get(roomCode);
  if (!room) return;
  let correct = false;
  const currentQuestion = room.quizData.questions[room.currentQuestion];
  if (currentQuestion.questionType === "FRQ") {
    correct = answer === currentQuestion.correctAnswer; // placeholder
  } else if (currentQuestion.questionType === "MCQ") {
    const correctChoices = currentQuestion.choices?.filter(
      (val) => val.correctChoice
    );
    if (correctChoices) {
      correct = correctChoices?.some(
        (val) => parseInt(answer.split(":")[0]) === val.choiceNumber
      );
    }
  }
  const response: StudentResponse = {
    username,
    answer,
    id,
    status: correct ? "Correct" : "Ungraded",
  };
  room.answers[room.currentQuestion].push(response);
  return response;
}

export function removeAnswer(roomCode: string, id: string) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.answers[room.currentQuestion].filter((v) => v.id !== id);
}

export interface QuizResponseData {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  slides: string;
  creator: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  questions: {
    _id: string;
    statement: string;
    afterSlide: number;
    questionType: "" | "MCQ" | "FRQ";
    choices?: {
      choiceBody: string;
      choiceNumber: number;
      correctChoice: boolean;
    }[];
    correctAnswer?: string;
  }[];
}

export type StudentResponseStatus =
  | "Correct"
  | "Incorrect"
  | "Graded"
  | "Ungraded";

export type StudentResponse = {
  id: string;
  username: string;
  answer: string;
  status: StudentResponseStatus;
};

// Correct: 1000
// Wrong: 0
