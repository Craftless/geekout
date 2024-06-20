import Select from "react-select";

export const SelectField = ({ options, field, form }: any) => (
  <Select
    options={options}
    name={field.name}
    value={
      options ? options.find((option: any) => option.value === field.value) : ""
    }
    onChange={(option) => form.setFieldValue(field.name, option.value)}
    onBlur={field.onBlur}
    className="my-react-select-container"
    classNamePrefix="my-react-select"
  />
);
