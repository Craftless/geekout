import { randomUUID } from "crypto";
import multer from "multer";

const MIME_TYPE_MAP = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
};

export const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log(file.filename);

      cb(null, "uploads/slides");
    },
    filename: (req, file, cb) => {
      console.log(file.filename);

      // @ts-ignore
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, randomUUID() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    console.log(file.filename);
    // @ts-ignore
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    // @ts-ignore
    cb(error, isValid); // ???? first argument only accepts null acc to typescript?
  },
});
