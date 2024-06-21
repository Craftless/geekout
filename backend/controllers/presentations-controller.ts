import mongoose, { HydratedDocument } from "mongoose";
import { HttpError } from "../util/http-error";

import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { writeFile } from "fs";
import path from "path";
import { pdf } from "pdf-to-img";
import Presentation, { IPresentation } from "../models/presentation";
import Question, { IQuestion } from "../models/question";
import User, { IUser } from "../models/user";

const presentationsPerPage = 10;

// Structure:
/*
interface Presentation {
  title: string;
  description?: string;
  isPublic: boolean;
  questions: Question[];
  creator: through token
}

*/

interface Question {
  statement: string;
  questionType: "MCQ" | "FRQ";
  afterSlide: number;
  correctAnswer?: string;
  choices?: {
    choiceNumber: number;
    choiceBody: string;
    correctChoice: boolean;
  }[];
}

interface QuestionRequestData {
  _id: string;
  statement: string;
  questionType: "MCQ" | "FRQ";
  correctAnswer?: string;
  afterSlide: number;
  choices?: {
    choiceNumber: number;
    choiceBody: string;
    correctChoice: boolean;
  }[];
}

// 401 - Unauthenticated, 403 - Unauthorized

interface CreatePresentationRequestData {
  title: string;
  description: string;
  isPublic: boolean;
  questions: QuestionRequestData[];
}

const createPresentationFromArgs = async (
  title: string,
  description: string,
  isPublic: string,
  slides: string,
  slideCount: number,
  questions: any,
  creator: string,
  next: NextFunction
) => {
  const createdPresentation: HydratedDocument<IPresentation> = new Presentation(
    {
      title,
      description,
      isPublic,
      slides,
      slideCount,
      questions: [],
      creator,
    }
  );

  let user: HydratedDocument<IUser> | null;
  try {
    user = await User.findById(createdPresentation.creator);
  } catch (err) {
    return next(new HttpError("Finding user failed", 500));
  }
  if (!user) return next(new HttpError("Could not find user", 404));
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    for (const question of questions) {
      await createQuestionFromArgs(
        question,
        createdPresentation,
        session,
        next
      );
    }
    await createdPresentation.save({ session });
    user.presentations.push(createdPresentation);
    await user.save({ session });
    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    return next(new HttpError("Creating presentation failed", 500));
  }
  return true;
};

const createQuestionFromArgs = async (
  question: Question,
  parentPresentation: HydratedDocument<IPresentation>,
  session: mongoose.ClientSession,
  next: NextFunction
) => {
  try {
    const createdQuestion: HydratedDocument<IQuestion> = new Question({
      statement: question.statement,
      questionType: question.questionType,
      choices: question.choices,
      correctAnswer: question.correctAnswer,
      afterSlide: question.afterSlide,
      parentPresentation: parentPresentation._id,
    });
    await createdQuestion.save({ session });
    parentPresentation.questions.push(createdQuestion);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Failed to create question", 500));
  }
};

export const createPresentation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }
  if (!req.file) {
    return next(new HttpError("No slides were uploaded", 422));
  }
  const { reqBody } = req.body;
  const { title, description, isPublic, questions } = JSON.parse(reqBody); // questions will be an array
  console.log(req.file?.filename);

  // @ts-ignore
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const document = await pdf(
    path.join(__dirname, "..", "uploads", "slides", req.file.filename)
  );
  for await (const image of document) {
    writeFile(
      path.join(
        __dirname,
        "..",
        "images",
        req.file.filename.split(".pdf")[0] + ".png"
      ),
      image,
      (err) => {
        if (err) {
          return console.log("There was an error saving the file");
        }
        console.log("The file was saved");
      }
    );
    break;
  }

  const createdPresentation = await createPresentationFromArgs(
    title,
    description,
    isPublic,
    req.file.filename,
    document.length,
    questions,
    req.userData!.userId,
    next
  );

  if (createdPresentation === true)
    res.status(201).json({
      presentation: createdPresentation,
    });
};

export const getAllPublicPresentations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let presentations;
  const page: number = Number(req.query.page) || 1;
  try {
    presentations = await Presentation.find()
      .or([{ isPublic: true }, { creator: req.userData!.userId }])
      .sort({ createdAt: -1 })
      .skip(presentationsPerPage * (page - 1))
      .limit(presentationsPerPage);
  } catch (err) {
    return next(new HttpError("Finding presentations failed.", 500));
  }

  res.status(200).json({ presentations });
};

export const getPresentationsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uid = req.params.uid;
  if (!uid) {
    return next(new HttpError("Invalid user", 422));
  }
  const page: number = Number(req.query.page) || 1;
  let showPrivate = false;
  if (uid == req.userData!.userId) showPrivate = true;
  let presentations;
  try {
    if (showPrivate) {
      presentations = await Presentation.find({
        creator: uid,
      })
        .sort({ createdAt: -1 })
        .skip(presentationsPerPage * (page - 1))
        .limit(presentationsPerPage);
    } else {
      presentations = await Presentation.find({
        creator: uid,
        isPublic: true,
      })
        .sort({ createdAt: -1 })
        .skip(presentationsPerPage * (page - 1))
        .limit(presentationsPerPage);
    }
  } catch (err) {
    return next(new HttpError("Finding presentations failed.", 500));
  }
  res.json({ presentations });
};

export const getPresentationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const qid = req.params.qid;
  if (!qid) return next(new HttpError("Invalid query", 422));
  let presentation;
  try {
    presentation = await Presentation.findById(qid)
      .populate("questions")
      .populate("creator", "-password");
    if (
      presentation &&
      !presentation.isPublic &&
      presentation.creator &&
      (presentation.creator as IUser).id != req.userData!.userId
    ) {
      return next(new HttpError("Unauthorized", 403));
    }
  } catch (err) {
    return next(new HttpError("Finding presentation failed.", 500));
  }
  res.json({ presentation });
};

export const updatePresentation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Invalid inputs: ${JSON.stringify(errors.array)}`, 422)
    );
  }
  const qid = req.params.qid;
  if (!qid) return next(new HttpError("Invalid query", 422));
  let presentation: HydratedDocument<IPresentation> | null;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      presentation = await Presentation.findById(qid);
      if (!presentation)
        return next(new HttpError("Presentation does not exist", 422));
      if (presentation.creator?._id.toString() != req.userData!.userId)
        return next(new HttpError("Unauthorized", 403));
    } catch (err) {
      return next(new HttpError("Updating presentation failed.", 500));
    }
    const { questions, title, description, isPublic } =
      req.body as CreatePresentationRequestData;

    if (title) presentation.title = title;
    if (description) presentation.description = description;
    if (isPublic) presentation.isPublic = isPublic;

    for (const question of questions) {
      // question only contains data that can be updated
      try {
        if (question._id == "new") {
          await createQuestionFromArgs(question, presentation!, session, next);
        } else if (question._id.startsWith("delete ")) {
          await deleteQuestionFromArgs(
            req.userData!.userId,
            question._id.substring(7),
            session,
            next
          );
        } else {
          const { _id, ...rest } = question;
          const unset: { correctAnswer?: number; choices?: number } = {};
          if (rest.questionType === "MCQ") unset.correctAnswer = 1;
          if (rest.questionType === "FRQ") unset.choices = 1;
          await Question.findByIdAndUpdate(
            _id,
            {
              ...rest,
              $unset: {
                ...unset,
              },
            },
            { session }
          );
        }
      } catch (err) {
        console.log(err);
        return next(new HttpError("Failed to create question", 500));
      }
    }

    await presentation.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    return next(new HttpError("Something went wrong. Try again later", 500));
  }

  res.status(201).json({ message: "Update successful!" });
};

export const deletePresentation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const qid = req.params.qid;

  if (!qid) return next(new HttpError("Invalid query", 422));
  let presentation: any; // PopulatedDoc does not contain methods
  try {
    presentation = await Presentation.findById(qid)
      .populate("creator")
      .populate("questions");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete presentation.", 500)
    );
  }

  if (!presentation)
    return next(new HttpError("Presentation does not exist", 422));
  if (presentation.creator.id != req.userData!.userId)
    return next(new HttpError("Unauthorized", 403));

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await presentation.deleteOne({ session });
    presentation.creator.presentations.pull(presentation);
    await presentation.creator.save({ session });
    for (const question of presentation.questions) {
      await question.deleteOne({ session });
    }
    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete presentation.", 500)
    );
  }
  res.status(200).json({ message: "Deleted presentation!" });
};

export const deleteQuestionFromArgs = async (
  userId: string,
  questionId: string,
  session: mongoose.ClientSession,
  next: NextFunction
) => {
  if (!questionId) return next(new HttpError("Invalid question", 422));
  let question: any; // PopulatedDoc does not contain methods
  try {
    question = await Question.findById(questionId).populate(
      "parentPresentation"
    );
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete question.", 500)
    );
  }

  if (!question) return next(new HttpError("Question does not exist", 422));
  if (question.parentPresentation.creator._id.toString() != userId)
    return next(new HttpError("Unauthorized", 403));

  try {
    await question.deleteOne({ session });
    question.parentPresentation.questions.pull(question);
    await question.parentPresentation.save({ session });
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete question.", 500)
    );
  }
};
