import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = (_props: { asOverlay?: boolean }) => {
  // TODO remove this
  return (
    <div
      className={`${
        // props.asOverlay &&
        "h-full w-full absolute top-0 left-0 flex justify-center items-center"
      }`}
    >
      <div className={styles["lds-dual-ring"]}></div>
    </div>
  );
};

export default LoadingSpinner;
