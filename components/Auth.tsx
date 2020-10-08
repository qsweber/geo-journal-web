import React from "react";
import Router from "next/router";

import { CognitoClient } from "../clients/cognito";
import { User } from "../interfaces";

const cognitoClient = new CognitoClient();

interface Props {
  loggedInUser: User | undefined;
}

const Auth = (props: Props) => {
  if (props.loggedInUser) {
    return (
      <div>
        <span>{props.loggedInUser.email + " "}</span>
        <input
          type="submit"
          value="Sign Out"
          onClick={() => {
            cognitoClient.signOut();
            location.reload();
          }}
        />
      </div>
    );
  } else {
    return (
      <div>
        <input
          type="submit"
          value="Login or Sign Up"
          onClick={() => {
            Router.push("/login");
          }}
        />
      </div>
    );
  }
};

export default Auth;
