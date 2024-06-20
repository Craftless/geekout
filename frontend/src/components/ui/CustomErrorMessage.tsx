import { cn } from "@/lib/utils";
import { ErrorMessage } from "formik";

interface Props {
  name: string;
  size?: "small" | "smallest" | "normal" | "large";
  [x: string]: any;
}

const sizeMapping = {
  smallest: "text-xs",
  small: "text-sm",
  normal: "text-base",
  large: "text-lg",
};

const CustomErrorMessage = ({ size, ...props }: Props) => {
  if (!size) size = "small";
  return (
    <ErrorMessage
      component="div"
      {...props}
      className={cn("text-red-500 italic", sizeMapping[size])}
    />
  );
};

export default CustomErrorMessage;
