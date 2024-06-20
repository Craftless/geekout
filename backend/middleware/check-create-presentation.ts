import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";

export default (req: Request, res: Response, next: NextFunction) => {
  checkSchema(
    {
      title: {
        errorMessage: "Invalid title",
        trim: true,
        isString: true,
        notEmpty: true,
      },
      description: {
        errorMessage: "Invalid description",
        trim: true,
        isString: true,
        notEmpty: true,
      },
      isPublic: {
        errorMessage: "Invalid isPublic",
        trim: true,
        notEmpty: true,
        isBoolean: true,
      },
      "questions.*.statement": {
        errorMessage: "Invalid question statement",
        trim: true,
        isString: true,
        notEmpty: true,
      },
      "questions.*.questionType": {
        isIn: {
          options: [["MCQ", "FRQ"]],
          errorMessage: "Invalid question type",
        },
      },
      "questions.*.correctAnswer": {
        isString: true,
      },
      "questions.*.choices.*.choiceNumber": {
        isInt: true,
      },
      "questions.*.choices.*.choiceBody": {
        isString: true,
      },
      "questions.*.choices.*.correctChoice": {
        isBoolean: true,
      },
    },
    ["body"]
  );
  next();
};

// Structure:
/*
interface Quiz {
  title: string;
  description: string;
  isPublic: boolean;
  questions: Question[];
  creator: through token
}

interface Question {
  statement: string;
  questionType: "MCQ" | "FRQ";
  correctAnswer?: string;
  choices?: {
    choiceNumber: number;
    choiceBody: string;
    correctChoice: boolean;
  }[];
}
*/
