import {
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const desktop = "(min-width: 768px)";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateTransform(date: string) {
  // 2024-04-21T15:00:19.162Z
  return new Date(date).toLocaleDateString();
}

const ALPHABET = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export function numberToString(number: number): string {
  if (typeof number !== "number") {
    throw new Error("Must be a nunber.");
  }
  if (number <= 0) {
    throw new RangeError("Number must be > 0.");
  }
  let res = "";
  let a = number - 1;
  while (true) {
    const remainder = a % ALPHABET.length;
    res = ALPHABET[remainder] + res;
    if (a < ALPHABET.length) {
      break;
    }
    a = Math.floor(a / ALPHABET.length) - 1;
  }
  return res;
}

export function stringToNumber(input: string): number {
  if (!input.length) {
    throw new Error("Input must not be empty.");
  }
  return input
    .split("")
    .reverse()
    .reduce((acc, letter, i) => {
      const offset = ALPHABET.indexOf(letter);
      if (offset <= -1) {
        throw new Error(`Letter missing from alphabet: ${letter}`);
      }
      return acc + (offset + 1) * Math.pow(ALPHABET.length, i);
    }, 0);
}

export const findDeleted = (initial: any[], final: any[]) => {
  let finalIds = new Set(final.map((q) => q._id));
  let deleted = initial.filter((q) => !finalIds.has(q._id)).map((q) => q._id);
  return deleted;
};

export function findAllByKey(obj: any, keyToFind: string): any {
  return Object.entries(obj).reduce(
    (acc: any, [key, value]: [key: string, value: any]) =>
      key === keyToFind
        ? acc.concat(value)
        : typeof value === "object"
        ? acc.concat(findAllByKey(value, keyToFind))
        : acc,
    []
  );
}

export const getObjectValues = (obj: any): any =>
  obj && typeof obj === "object"
    ? Object.values(obj).map(getObjectValues).flat()
    : [obj];

export const transformMCQResponses = (choice: Choice): string => {
  return choice.choiceNumber + ": " + choice.choiceBody;
};

export const getTableRowColour = (status: StudentResponseStatus): string => {
  switch (status) {
    case "Correct":
      return "bg-green-300 hover:bg-green-200/50 data-[state=selected]:bg-green-200";
    case "Incorrect":
      return "bg-red-300 hover:bg-red-200/50 data-[state=selected]:bg-red-200";
    default:
      return "";
  }
};

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
  questions: Question[];
}

export type Question = {
  _id: string;
  statement: string;
  afterSlide: number;
  questionType: "" | "MCQ" | "FRQ";
  choices?: Choice[];
  correctAnswer?: string;
};

export type Choice = {
  choiceBody: string;
  choiceNumber: number;
  correctChoice: boolean;
};

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

export const statuses = [
  {
    value: "Correct",
    label: "Correct",
    icon: CheckCircledIcon,
  },
  {
    value: "Incorrect",
    label: "Incorrect",
    icon: CrossCircledIcon,
  },
  {
    value: "Graded",
    label: "Graded",
    icon: InfoCircledIcon,
  },
  {
    value: "Ungraded",
    label: "Ungraded",
    icon: MinusCircledIcon,
  },
];

export type StudentScores = { student: string; scoresByQuestion: number[] };
