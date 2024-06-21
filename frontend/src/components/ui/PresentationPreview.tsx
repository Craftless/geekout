import { cn } from "@/lib/utils";
import { useState } from "react";

const PresentationPreview = ({
  slides,
  height = "h-32",
  width = "w-64",
  className,
}: {
  slides?: string;
  height?: string | null;
  width?: string | null;
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    // <div className={cn(`w-${width}`, `h-${height}`, className)}>
    <>
      {slides && (
        <img
          className={cn(
            loaded ? width : 0,
            loaded ? height : 0,
            "object-contain bg-black/20",
            className
          )}
          src={`${import.meta.env.VITE_SERVER_ADDRESS}/images/${
            slides.split(".pdf")[0] + ".png"
          }`}
          onLoad={() => setLoaded(true)}
        />
      )}
      {(!loaded || !slides) && (
        <div className={cn(`skeleton w-${width} h-${height}`, className)}></div>
      )}
      {/* </div> */}
    </>
  );
};

export default PresentationPreview;
