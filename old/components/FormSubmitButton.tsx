import React, { useState } from "react";
import Router from "next/router";

interface Props {
  label: string;
  onClick: () => Promise<void>;
  redirectOnSuccess?: string;
}

const FormSubmitButton = (props: Props) => {
  const [error, setError] = useState("");
  return (
    <div>
      <input
        type="submit"
        value={props.label}
        style={{ marginTop: 8 }}
        onClick={async () => {
          setError("");
          try {
            await props.onClick();
          } catch (err) {
            setError(err.message);
            return;
          }
          if (props.redirectOnSuccess) {
            Router.push(props.redirectOnSuccess);
          }
        }}
      />
      <br />
      <span style={{ color: "red", marginTop: 8 }}>{error}</span>
    </div>
  );
};

export default FormSubmitButton;
