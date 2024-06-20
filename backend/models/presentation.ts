import mongoose, { PopulatedDoc, Schema } from "mongoose";
import { IQuestion } from "./question";
import { IUser } from "./user";

export interface IPresentation {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  slides: string;
  questions: PopulatedDoc<IQuestion>[];
  creator: PopulatedDoc<IUser>;
}

const presentationSchema = new Schema<IPresentation>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    slides: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPresentation>(
  "Presentation",
  presentationSchema
);
