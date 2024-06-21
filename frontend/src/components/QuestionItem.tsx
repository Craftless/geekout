import { GameContext } from "@/context/game-context";
import {
  Choice,
  Question,
  cn,
  numberToString,
  transformMCQResponses,
} from "@/lib/utils";
import { socket } from "@/socket";
import { Field, Form, Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

type FRQFormValues = {
  answer: string;
};

const initialValues: FRQFormValues = {
  answer: "",
};

const QuestionItem = ({
  question,
  roomCode,
}: {
  question: Question | undefined;
  roomCode: string;
}) => {
  const { toast } = useToast();
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const game = useContext(GameContext);
  function submitAnswer(answer: string) {
    if (!question) return;
    if (submittedAnswer) return;
    setSubmittedAnswer(answer);
    console.log("map", game.questionNumberMap);
    socket.emitEvent(
      "s_submit_answer",
      roomCode,
      answer,
      question._id,
      game.questionNumberMap[question._id]
    );
    toast({
      variant: "default",
      title: "Success!",
      description: "Your answer was submitted",
      duration: 2000,
    });
  }
  function frqSubmitHandler(values: FRQFormValues) {
    submitAnswer(values.answer);
  }

  function mcqSubmitHandler(choice: Choice) {
    submitAnswer(transformMCQResponses(choice));
  }

  useEffect(() => {
    setSubmittedAnswer("");
  }, [question]);

  if (!question) {
    return <p>Waiting for question...</p>;
  }

  return (
    <div>
      <p>Question type: {question.questionType}</p>
      <p>Statement: {question.statement}</p>
      {submittedAnswer}
      {question.questionType === "FRQ" && (
        <div>
          <Formik initialValues={initialValues} onSubmit={frqSubmitHandler}>
            <Form>
              <Field
                as={Textarea}
                name="answer"
                placeholder="Enter your answer here"
              />
              <Button type="submit" disabled={!!submittedAnswer}>
                Submit
              </Button>
            </Form>
          </Formik>
        </div>
      )}
      {question.questionType === "MCQ" && (
        <div className="space-y-2 mt-2">
          {question.choices?.map((choice: Choice) => {
            return (
              <Button
                variant="outline"
                key={choice.choiceNumber}
                className={cn(
                  "w-full grid grid-cols-[3rem_1fr] grid-rows-[1fr] gap-x-1 md:gap-x-2 items-center border border-border p-2 h-fit",
                  submittedAnswer === transformMCQResponses(choice) &&
                    "disabled:opacity-100 border-2"
                )}
                onClick={() => mcqSubmitHandler(choice)}
                disabled={!!submittedAnswer}
              >
                <div className="col-start-1 col-span-1 justify-self-center self-center rounded-full bg-sky-700 h-8 w-8 flex justify-center items-center">
                  <p className="text-center text-white">
                    {numberToString(choice.choiceNumber).toUpperCase()}
                  </p>
                </div>
                <p className="flex flex-1 col-start-2 col-span-1">
                  {choice.choiceBody}
                </p>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
