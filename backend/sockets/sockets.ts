import { randomUUID } from "crypto";
import path, { dirname } from "path";
import { pdf } from "pdf-to-img";
import { Server, Socket } from "socket.io";
import { fileURLToPath } from "url";
import {
  QuizResponseData,
  StudentResponse,
  StudentResponseStatus,
  createRoom,
  fetchScores,
  getRooms,
  joinRoom,
  removeAnswer,
  removeRoom,
  removeStudentFromRoom,
  submitAnswer,
  updateResponseStatusAndScore,
} from "./socket_store";

function socketMain(io: Server) {
  io.on("connection", (socket) => {
    console.log(`${socket.id} connected to ${process.pid}.`);
    socket.emit("welcome", "Welcome to the server.");
    socket.on("disconnecting", (reason) => {
      if (socket.host) {
        removeRoom(socket.host);
        io.to(socket.host).emit("remove_room");
        io.in(socket.host).socketsLeave(socket.host);
      }
      if (!socket.username) return;
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          removeStudentFromRoom(room, socket.username);
          io.to(room).emit("student_leave", { username: socket.username });
        }
      }
    });
    socket.on("join_room", async ({ room, username }, ack) => {
      console.log("Attempted join");
      if (getRooms().has(room)) {
        if (
          getRooms()
            .get(room)
            ?.students.some((s) => s == username)
        ) {
          if (socket.username == username) {
            ack({
              status: { value: null, message: "You are already connected " },
            });
          }
          ack({
            status: { value: false, message: "Username already exists!" },
          });
          return;
        }
        const rm = getRooms().get(room);
        if (!rm) {
          ack({
            status: {
              value: false,
              message: "Room does not exist with specified room code.",
            },
          });
        } else {
          console.log(getRooms().get(room)?.students);
          const rooms = socket.rooms;
          rooms.forEach((room) => {
            if (room !== socket.id) socket.leave(room);
          });
          joinRoom(room, username, socket);
          socket.username = username;
          await socket.join(room);
          socket.roomCode = room;
          console.log("Successful join");
          io.to(room).emit("student_join", { username });
          // @ts-ignore
          const __dirname = dirname(fileURLToPath(import.meta.url));
          const document = await pdf(
            path.join(__dirname, "..", "uploads", "slides", rm.quizData.slides)
          );
          let count = 0;
          for await (const image of document) {
            io.to(room).emit("slides", image, count, document.length);
            count++;
          }
          ack({
            status: { value: true },
            students: getRooms().get(room)?.students,
            qid: getRooms().get(room)?.quizId,
            quizData: getRooms().get(room)?.quizData,
            numOfSlides: document.length,
          });
          if (getRooms().get(room)?.started) socket.emit("c_start_quiz");
        }
      } else {
        ack({
          status: {
            value: false,
            message: "Room does not exist with specified room code.",
          },
        });
      }
    });
    socket.on("check_create_room", (room, cb) => {
      if (io.sockets.adapter.rooms.has(room)) cb(false);
      else cb(true);
    });
    socket.on(
      "create_room",
      async (room, quizId, quizData: QuizResponseData, cb) => {
        console.log("Attempted create");
        if (!room || !quizId || !quizData) {
          cb({ room: null });
          return;
        }
        if (!io.sockets.adapter.rooms.has(room)) {
          const rooms = socket.rooms;
          rooms.forEach((room) => {
            if (room !== socket.id) socket.leave(room);
          });
          await socket.join(room);
          console.log("Successful create", io.sockets.adapter.rooms);
          socket.host = room;
          createRoom(room, quizId, quizData, socket, quizData.questions.length);
          cb({ room });
        } else {
          cb({ room: null });
        }
      }
    );
    socket.on("check_room", async ({ room }, ack) => {
      if (getRooms().has(room) && !getRooms().get(room)!.started)
        ack({ canJoin: true });
      else ack({ canJoin: false });
    });
    socket.on("s_start_quiz", (ack) => {
      if (!socket.host) return;
      const room = getRooms().get(socket.host);
      if (!room) return;
      if (room.started) return;
      io.to(socket.host).emit("c_start_quiz");
      room.started = true;
      room.scores = room.students.map((stu) => ({
        student: stu,
        scoresByQuestion: [],
      }));
      ack();
    });
    socket.on("s_change_question", (questionNumber) => {
      if (!socket.host) return;
      const room = getRooms().get(socket.host);
      if (!room) return;
      if (!room.started) return;
      console.log("server change question ", questionNumber);
      io.to(socket.host).emit("c_change_question", questionNumber);
      room.currentQuestion = questionNumber;
    });
    socket.on("s_change_slide", (slideNumber) => {
      if (!socket.host) return;
      const room = getRooms().get(socket.host);
      if (!room) return;
      if (!room.started) return;
      console.log("server change slide ", slideNumber);
      io.to(socket.host).emit("c_change_slide", slideNumber);
      room.currentSlide = slideNumber;
    });
    socket.on("s_submit_answer", (roomCode, answer) => {
      if (!socket.username) return;
      const hostId = getRooms().get(roomCode)?.hostId;
      if (!hostId) return;
      console.log("Submitting answer", answer);
      const id = randomUUID();
      const response = submitAnswer(roomCode, socket.username, answer, id);
      if (!response) return;
      updateResponseStatus(io, socket, response, response.status);
      io.to(hostId).emit("t_submit_answer", response);
    });
    socket.on("s_delete_answer", (id) => {
      if (!socket.host) return;
      removeAnswer(socket.host, id);
      socket.emit("t_delete_answer", id);
    });
    socket.on(
      "s_update_response_status",
      (response: StudentResponse, status: StudentResponseStatus) => {
        updateResponseStatus(io, socket, response, status);
      }
    );
    socket.on("s_fetch_scores", () => {
      if (!socket.host) return;
      const scores = fetchScores(socket.host);
      if (!scores) return;
      io.to(socket.host).emit("t_fetch_scores", scores);
    });
  });
}

const updateResponseStatus = (
  io: Server,
  socket: Socket,
  response: StudentResponse,
  status: StudentResponseStatus
) => {
  if (!socket.host) return;
  updateResponseStatusAndScore(socket.host, response, status);
  io.to(socket.host).emit("t_update_response_status", {
    ...response,
    status,
  } as StudentResponse);
};

export default socketMain;

declare module "socket.io" {
  interface Socket {
    username?: string;
    host?: string;
    roomCode?: string;
  }
}
