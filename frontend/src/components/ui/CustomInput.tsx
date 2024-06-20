import { cn } from "@/lib/utils";
import { getIn } from "formik";
import { Input as StyledInput } from "./input";
import { Label } from "./label";

interface InputProps {
  label: string;
  type: string;
  textarea?: boolean;
  rows?: number;
  fullFlex?: boolean;
  className?: string;
  divClassName?: string;
  labelClassName?: string;
  invalidOnError?: boolean;
  [x: string]: any;
}

// million-ignore
export const Input = ({
  label,
  type,
  textarea,
  rows,
  fullFlex,
  className,
  divClassName,
  labelClassName,
  invalidOnError,
  ...props
}: InputProps) => {
  if (!type) type = "text";
  const elementStyles = cn(
    "w-full border border-solid px-3 py-2 rounded border-gray-400",
    invalidOnError &&
      getIn(props.errors, props.name) &&
      getIn(props.touched, props.name) &&
      "text-red-600 border-red-600 bg-red-200",
    className
  );
  const element = textarea ? ( // TODO work on textarea
    <textarea
      id={props.name}
      rows={rows || 3}
      {...props}
      className={elementStyles}
    />
  ) : (
    <StyledInput
      id={props.name}
      type={type}
      {...props}
      className={cn(
        "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring",
        invalidOnError &&
          getIn(props.errors, props.name) &&
          getIn(props.touched, props.name) &&
          "text-red-600 border-red-600 bg-red-200",
        className
      )}
    />
  );
  return (
    <div
      className={cn(
        "grid w-full items-center gap-1.5",
        divClassName,
        fullFlex && "flex-1"
      )}
    >
      <Label
        htmlFor={props.name}
        className={cn("font-semibold block", labelClassName)}
      >
        {label}
      </Label>
      {element}
    </div>
  );
};
