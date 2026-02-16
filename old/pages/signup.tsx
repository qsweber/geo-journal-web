import React, { useState } from "react";

import { CognitoClient } from "../clients/cognito";
import Centered from "../components/Centered";
import FormInput from "../components/FormInput";
import FormSubmitButton from "../components/FormSubmitButton";

const cognitoClient = new CognitoClient();

const SignUpPage = () => {
  const [showVerify, setShowVerify] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  return (
    <Centered title="Sign Up">
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
        label="Sign up"
        onClick={async () => {
          await cognitoClient.signUp(username, password);
          setShowVerify(true);
        }}
      />
      {showVerify ? (
        <div>
          <FormInput
            type="text"
            placeholder="Token (check email)"
            value={token}
            setValue={setToken}
          />
          <br />
          <FormSubmitButton
            label="Verification Code"
            onClick={async () => {
              await cognitoClient.confirmRegistration(
                username,
                password,
                token
              );
            }}
            redirectOnSuccess={"/"}
          />
        </div>
      ) : undefined}
    </Centered>
  );
};

export default SignUpPage;
