import mongoose, { PopulatedDoc } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { IPresentation } from "./presentation";

const Schema = mongoose.Schema;

export interface IUser {
  _id: mongoose.Types.ObjectId;
  id: string;
  username: string;
  password: string;
  presentations: PopulatedDoc<IPresentation>[];
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  presentations: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Presentation",
    },
  ],
});

userSchema.plugin(uniqueValidator);

export default mongoose.model<IUser>("User", userSchema);
