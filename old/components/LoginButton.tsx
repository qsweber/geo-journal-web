import React from "react";
import Router from "next/router";

interface Props {}

const Auth = (_props: Props) => {
  return (
    <input
      type="submit"
      value="Login or Sign Up"
      onClick={() => {
        Router.push("/login");
      }}
    />
  );
};

export default Auth;
