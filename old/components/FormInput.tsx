import React from "react";

interface Props {
  type: "text" | "password" | "email";
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
}

const FormInput = (props: Props) => {
  return (
    <input
      type={props.type}
      placeholder={props.placeholder}
      style={{ marginTop: 8 }}
      value={props.value}
      onChange={(event) => props.setValue(event.target.value)}
    />
  );
};

export default FormInput;
