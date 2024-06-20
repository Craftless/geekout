import express from "express";
import {
  createPresentation,
  deletePresentation,
  getAllPublicPresentations,
  getPresentationById,
  getPresentationsByUserId,
  updatePresentation,
} from "../controllers/presentations-controller";
import checkAuth from "../middleware/check-auth";
import checkCreatePresentation from "../middleware/check-create-presentation";
import checkUpdatePresentation from "../middleware/check-update-presentation";
import { fileUpload } from "../middleware/file-upload";

const router = express.Router();

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("slides"),
  checkCreatePresentation,
  createPresentation
);
router.get("/all", getAllPublicPresentations);
router.get("/user/:uid", getPresentationsByUserId);
router.get("/:qid", getPresentationById);
router.patch("/:qid", checkUpdatePresentation, updatePresentation);
router.delete("/:qid", deletePresentation);

export default router;
