import { FormikErrors } from "formik";
import { ChangeEvent, useRef, useState } from "react";
import { CreateQuizFormValues } from "../presentations/CreateQuizForm";
import { Button } from "./button";

const PresentationUpload = ({
  setFieldValue,
}: {
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<CreateQuizFormValues>>;
}) => {
  const [file, setFile] = useState<File>();

  const filePickerRef = useRef<HTMLInputElement>(null);

  function pickedHandler(e: ChangeEvent<HTMLInputElement>) {
    let pickedFile;
    if (e.target.files && e.target.files.length === 1) {
      pickedFile = e.target.files[0];
      setFile(pickedFile);
      setFieldValue("slides", pickedFile);
    }
  }

  function pickFileHandler() {
    if (!filePickerRef.current) return;
    filePickerRef.current.click();
  }
  return (
    <div>
      <input
        ref={filePickerRef}
        style={{ display: "none" }}
        type="file"
        accept=".pdf,.pptx"
        onChange={pickedHandler}
      />
      <div>
        <div>
          <p>{file?.name || "Please pick a file"}</p>
        </div>
        <Button type="button" onClick={pickFileHandler}>
          Pick File
        </Button>
      </div>
    </div>
  );
};

export default PresentationUpload;
