import mongoose, { PopulatedDoc, Schema } from "mongoose";
import { IPresentation } from "./presentation";

export interface IQuestion {
  id: string;
  statement: string;
  questionType: "MCQ" | "FRQ";
  afterSlide: number;
  correctAnswer?: string;
  choices?: Schema<IChoices>;
  parentPresentation: PopulatedDoc<IPresentation>;
}

export interface IChoices {
  choiceNumber: number;
  choiceBody: string;
  correctChoice: boolean;
}

const choicesSchema = new Schema<IChoices>(
  {
    choiceNumber: {
      type: Number,
      required: true,
    },
    choiceBody: {
      type: String,
    },
    correctChoice: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>({
  statement: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["MCQ", "FRQ"],
    required: true,
  },
  afterSlide: {
    type: Number,
    required: true,
  },
  correctAnswer: {
    type: String,
  },
  choices: {
    type: [choicesSchema],
  },
  parentPresentation: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Presentation",
  },
});

export default mongoose.model<IQuestion>("Question", questionSchema);
