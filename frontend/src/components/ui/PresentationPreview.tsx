import { useState } from "react";

const PresentationPreview = ({
  slides,
  height = 32,
  width = 64,
}: {
  slides: string;
  height?: number | string | null;
  width?: number | string | null;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <img
        className={`w-${width} h-${height} object-cover`}
        src={`${import.meta.env.VITE_SERVER_ADDRESS}/images/${
          slides.split(".pdf")[0] + ".png"
        }`}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <div className={`skeleton w-${width} h-${height}`}></div>}
    </>
  );
};

export default PresentationPreview;
