import { useField } from "formik";
import { LiaCheckSolid } from "react-icons/lia";

const Checkmark = (props: any) => {
  const [field] = useField({ name: props.name, type: "checkbox" });
  return (
    <label className="inline-flex items-center justify-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" {...field} />
      <div
        className={`peer peer-checked:bg-[#dcecd0] peer-checked:text-green-700 rounded-full w-8 h-8 flex justify-center items-center ${
          !field.checked && "peer-hover:bg-[#dcecd0a5]"
        }`}
      >
        <LiaCheckSolid className="peer" strokeWidth={4} />
      </div>
      {/* <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div> */}
    </label>
  );
};

export default Checkmark;
