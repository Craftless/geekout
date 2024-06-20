import { cn, getObjectValues, numberToString } from "@/lib/utils";
import { AI } from "@/utils/http";
import { useMutation } from "@tanstack/react-query";
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  FormikHelpers,
} from "formik";
import { AlertCircle } from "lucide-react";
import { LiaGlobeSolid, LiaLockSolid } from "react-icons/lia";
import { MdAdd, MdDeleteForever } from "react-icons/md";
import * as Yup from "yup";
import { SelectField } from "../SelectField";
import Checkmark from "../ui/Checkmark";
import CustomErrorMessage from "../ui/CustomErrorMessage";
import { Input } from "../ui/CustomInput";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import PresentationUpload from "../ui/presentation-upload";
import { useToast } from "../ui/use-toast";

export interface CreateQuizFormValues {
  title: string;
  description?: string;
  isPublic: string;
  slides: any;
  questions: {
    _id: string;
    statement: string;
    afterSlide: number;
    questionType: "MCQ" | "FRQ" | "";
    correctAnswer?: string;
    choices?: {
      choiceNumber: number;
      choiceBody: string;
      correctChoice: boolean;
    }[];
  }[];
}

const initialValues: CreateQuizFormValues = {
  title: "",
  description: "",
  isPublic: "true",
  slides: "",
  questions: [],
};

const validationSchema = Yup.object().shape({
  title: Yup.string().trim().required("Title is required"),
  description: Yup.string().trim().notRequired(),
  isPublic: Yup.boolean(),
  questions: Yup.array()
    .of(
      Yup.object().shape({
        statement: Yup.string().required("Question statement is required"),
        afterSlide: Yup.number().required("After slide is required"),
        questionType: Yup.string()
          .oneOf(["MCQ", "FRQ"])
          .required("Question type is required"),
        correctAnswer: Yup.string().test(
          "correctAnswer-test",
          "Correct answer is required",
          function (value) {
            const { questionType } = this.parent;
            return !(questionType === "FRQ" && !value);
          }
        ),
        choices: Yup.array()
          .of(
            Yup.object().shape({
              choiceNumber: Yup.number()
                .positive("Choice number has to be positive")
                .required("Choice number is required"),
              choiceBody: Yup.string(),
              correctChoice: Yup.boolean(),
            })
          )
          .test(
            "choices-test",
            "Please enter at least 1 choice",
            function (value) {
              const { questionType } = this.parent;
              if (questionType === "MCQ") {
                if (!value)
                  return this.createError({
                    message: "MCQ questions must have choices",
                  });
                if (value.length <= 0)
                  return this.createError({
                    message: "Please enter at least 1 choice",
                  });
              }
              return true;
            }
          )
          .test(
            "correctChoice-test",
            "At least one choice must be correct",
            function (value) {
              const { questionType } = this.parent;
              if (questionType === "MCQ") {
                if (!value)
                  return this.createError({
                    message: "MCQ questions must have choices",
                  });
                return value.some((val) => val.correctChoice);
              }
              return true;
            }
          )
          .test(
            "choiceBody-test",
            "Choice bodies are required",
            function (value) {
              const { questionType } = this.parent;
              if (questionType === "MCQ") {
                if (!value)
                  return this.createError({
                    message: "MCQ questions must have choices",
                  });
                return value.every((val) => val.choiceBody);
              }
              return true;
            }
          ),
      })
    )
    .min(1, "Please enter at least 1 question")
    .required("Questions are required"),
});

const options = [
  { value: "FRQ", label: "Open-Ended Questions" },
  { value: "MCQ", label: "Multiple Choice Questions" },
];

const CreateQuizForm = ({
  isLoading,
  submitHandler,
  submitButtonText,
  initialFormValues,
}: {
  isLoading: boolean;
  submitHandler: (
    values: CreateQuizFormValues,
    formikHelpers: FormikHelpers<CreateQuizFormValues>
  ) => void | Promise<any>;
  submitButtonText?: string;
  initialFormValues?: CreateQuizFormValues;
}) => {
  const { mutate, isPending } = useMutation({
    mutationFn: AI,
  });
  const { toast } = useToast();
  function AIGenerateQuestions(
    arrayHelpers: FieldArrayRenderProps,
    values: CreateQuizFormValues
  ) {
    const slides = values.slides;
    if (!slides) {
      toast({
        variant: "destructive",
        title: "Generating questions failed!",
        description: "You have not uploaded any slides.",
        duration: 3000,
      });
      return;
    }
    mutate(values.slides);
    arrayHelpers.push({
      _id: "new",
      statement: "",
      questionType: "",
      afterSlide: 0,
      correctAnswer: "",
      choices: [
        {
          choiceNumber: 1,
          choiceBody: "",
          correctChoice: false,
        },
      ],
    });
  }
  return (
    <Formik
      initialValues={initialFormValues || initialValues}
      validationSchema={validationSchema}
      onSubmit={submitHandler}
    >
      {({ isSubmitting, errors, values, setFieldValue }) => (
        <Form className="flex flex-col gap-4">
          <div>
            <Field as={Input} name="title" label="Title" />
            <CustomErrorMessage name="title" />
          </div>
          <div>
            <Field as={Input} name="description" label="Description" />
            <CustomErrorMessage name="description" />
          </div>
          <div className="flex flex-col my-2 gap-4">
            <div className="flex flex-row gap-2 items-center">
              <Field type="radio" name="isPublic" value="true" />
              <LiaGlobeSolid size={28} />
              <div className="flex flex-col">
                <p>Public</p>
                <p className="text-xs">
                  Anyone logged in can see this quiz. Only you can modify this
                  quiz.
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Field type="radio" name="isPublic" value="false" />
              <LiaLockSolid size={28} />
              <div className="flex flex-col">
                <p>Private</p>
                <p className="text-xs">Only you can see this quiz.</p>
              </div>
            </div>
          </div>
          <div>
            {/* <Field type="file" id="slides" name="slides" /> */}
            <PresentationUpload id="" setFieldValue={setFieldValue} />
          </div>
          <div className="md:border rounded md:px-6 py-4 my-6">
            <p className="text-lg font-bold mb-4">Questions</p>
            <FieldArray
              name="questions"
              render={(arrayHelpers) => (
                <div className="flex flex-col">
                  {values.questions.map((question, index) => (
                    <div key={`a${index}`}>
                      <div className="border-t border-gray-400"></div>
                      <div className="flex flex-col my-6 px-4 gap-4">
                        <div>
                          <Field
                            as={Input}
                            name={`questions[${index}].statement`}
                            label="Statement"
                            placeholder="Question statement"
                          />
                          <CustomErrorMessage
                            name={`questions[${index}].statement`}
                          />
                        </div>
                        <div>
                          <Field
                            as={Input}
                            name={`questions[${index}].afterSlide`}
                            label="After Slide"
                            placeholder="After slide"
                          />
                          <CustomErrorMessage
                            name={`questions[${index}].afterSlide`}
                          />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                          <p className="font-semibold block text-sm leading-none">
                            Question Type
                          </p>
                          <Field
                            component={SelectField}
                            name={`questions[${index}].questionType`}
                            label="Question Type"
                            options={options}
                          />
                          <CustomErrorMessage
                            name={`questions[${index}].questionType`}
                          />
                        </div>
                        {question.questionType === "FRQ" && (
                          <div>
                            <Field
                              as={Input}
                              name={`questions[${index}].correctAnswer`}
                              label="Correct Answer"
                            />
                            <CustomErrorMessage
                              name={`questions[${index}].correctAnswer`}
                            />
                          </div>
                        )}
                        {question.questionType === "MCQ" && (
                          <FieldArray
                            name={`questions[${index}].choices`}
                            render={(choicesArrayHelpers) => {
                              return (
                                <div className="flex flex-col gap-2">
                                  {question.choices &&
                                  question.choices.length ? (
                                    <>
                                      <p className="font-semibold block">
                                        Choices
                                      </p>
                                      {question.choices.map(
                                        (_choice, choiceIndex) => (
                                          <div
                                            key={choiceIndex}
                                            className="w-full grid grid-cols-[3rem_1fr_52px_repeat(2,min-content)] grid-rows-[1fr] gap-x-1 md:gap-x-2"
                                          >
                                            <div className="col-start-1 col-span-1 justify-self-center self-center rounded-full bg-sky-700 h-8 w-8 flex justify-center items-center">
                                              <p className="text-center text-white">
                                                {numberToString(
                                                  choiceIndex + 1
                                                ).toUpperCase()}
                                              </p>
                                            </div>
                                            <Field
                                              as={Input}
                                              name={`questions[${index}].choices[${choiceIndex}].choiceBody`}
                                              divClassName="flex-1 col-start-2 col-span-1"
                                              fullFlex
                                              placeholder="Enter a choice"
                                              invalidOnError
                                            />
                                            <div className="col-span-1 flex items-center justify-center">
                                              <Checkmark
                                                name={`questions[${index}].choices[${choiceIndex}].correctChoice`}
                                              />
                                            </div>
                                            <button
                                              className="col-span-1 min-w-4 flex justify-center items-center"
                                              type="button"
                                              onClick={() =>
                                                choicesArrayHelpers.insert(
                                                  choiceIndex + 1,
                                                  {
                                                    choiceNumber:
                                                      question.choices!.length +
                                                      1,
                                                    choiceBody: "",
                                                    correctChoice: false,
                                                  }
                                                )
                                              }
                                            >
                                              <MdAdd size={20} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (choiceIndex !== 0)
                                                  choicesArrayHelpers.remove(
                                                    choiceIndex
                                                  );
                                              }}
                                              disabled={choiceIndex === 0}
                                              className={cn(
                                                "col-span-1 min-w-4 flex justify-center items-center",
                                                choiceIndex === 0 &&
                                                  "text-neutral-500"
                                              )}
                                            >
                                              <MdDeleteForever />
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </>
                                  ) : (
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        choicesArrayHelpers.push({
                                          choiceNumber: 1,
                                          choiceBody: "",
                                          correctChoice: false,
                                        })
                                      }
                                      className="bg-blue-500 active:bg-blue-400 hover:bg-blue-400"
                                    >
                                      Add a choice
                                    </Button>
                                  )}
                                </div>
                              );
                            }}
                          />
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant={"destructive"}
                              className="mt-4"
                            >
                              Remove this question
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this question.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      arrayHelpers.push({
                        _id: "new",
                        statement: "",
                        questionType: "",
                        afterSlide: 0,
                        correctAnswer: "",
                        choices: [
                          {
                            choiceNumber: 1,
                            choiceBody: "",
                            correctChoice: false,
                          },
                        ],
                      })
                    }
                    variant={"default"}
                  >
                    Add a question
                  </Button>
                  <Button
                    type="button"
                    onClick={() => AIGenerateQuestions(arrayHelpers, values)}
                    variant={"default"}
                  >
                    Let AI generate questions
                  </Button>
                </div>
              )}
            />
          </div>
          <Button
            type="submit"
            className="bg-green-600 active:bg-green-500 hover:bg-green-500 disabled:bg-gray-400 disabled:cursor-default"
            disabled={isSubmitting}
            loading={isSubmitting || isLoading}
          >
            {submitButtonText || "Create Quiz"}
          </Button>
          <div>
            {errors && Object.keys(errors).length > 0 && (
              <Alert variant="destructive_filled" className="mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {getObjectValues(errors).map((msg: string, idx: number) => {
                    return <p key={idx}>{msg}</p>;
                  })}
                </AlertDescription>
              </Alert>
            )}
            {/* {errors &&
              errors.questions &&
              errors.questions.includes(
                "questions field must have at least 1 items"
              ) && (
                <Alert variant="destructive_filled" className="mt-8">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Please enter at least 1 question.
                  </AlertDescription>
                </Alert>
              )} */}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateQuizForm;
