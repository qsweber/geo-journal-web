import React, { useState } from "react";

import { CognitoClient } from "../clients/cognito";
import Centered from "../components/Centered";
import FormInput from "../components/FormInput";
import FormSubmitButton from "../components/FormSubmitButton";

const cognitoClient = new CognitoClient();

const ForgotPage = () => {
  const [showVerify, setShowVerify] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [token, setToken] = useState("");

  return (
    <Centered title="Forgot Password">
      <br />
      <FormInput
        type="text"
        placeholder="Email"
        value={username}
        setValue={setUsername}
      />
      <br />
      <FormSubmitButton
        label="Submit"
        onClick={async () => {
          await cognitoClient.forgotPassword(username);
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
          <FormInput
            type="password"
            placeholder="New Password"
            value={newPassword}
            setValue={setNewPassword}
          />
          <br />
          <FormSubmitButton
            label="Verification Code"
            onClick={async () => {
              await cognitoClient.confirmForgotPassword(
                username,
                newPassword,
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

export default ForgotPage;
