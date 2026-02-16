import React from "react";

import { CognitoClient } from "../clients/cognito";

const cognitoClient = new CognitoClient();

interface Props {}

const SignOutButton = (_props: Props) => {
  return (
    <input
      type="submit"
      value="Sign Out"
      onClick={() => {
        cognitoClient.signOut();
        location.reload();
      }}
    />
  );
};

export default SignOutButton;
