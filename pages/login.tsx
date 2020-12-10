import React, { useState } from "react";

import { CognitoClient } from "../clients/cognito";
import Centered from "../components/Centered";
import FormInput from "../components/FormInput";
import FormSubmitButton from "../components/FormSubmitButton";

const cognitoClient = new CognitoClient();

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Centered title="Login">
      <br />
      <FormInput
        type="text"
        placeholder="email"
        value={username}
        setValue={setUsername}
      />
      <br />
      <FormInput
        type="password"
        placeholder="password"
        value={password}
        setValue={setPassword}
      />
      <br />
      <FormSubmitButton
        label="Login"
        onClick={async () => {
          await cognitoClient.authenticateUser(username, password);
        }}
        redirectOnSuccess={"/"}
      />
    </Centered>
  );
};

export default LoginPage;
