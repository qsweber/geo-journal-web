import React, { useState } from "react";
import { CognitoClient, User } from "../clients/cognito";

const cognitoClient = new CognitoClient();

interface Props {
  loggedInUser: User | undefined;
}

const Auth = (props: Props) => {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  console.log("16", props.loggedInUser);
  return (
    <div>
      {props.loggedInUser ? <p>{props.loggedInUser.id}</p> : undefined}
      <select
        value={mode}
        onChange={(event) => setMode(event.target.value as any)}
      >
        <option value="login">Login</option>
        <option value="signup">Signup</option>
      </select>
      <p>{mode}</p>
      <input
        type="text"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="text"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <input
        type="submit"
        value="Submit"
        onClick={async () => {
          if (mode === "login") {
            await cognitoClient.authenticateUser(username, password);
            location.reload();
          } else {
            await cognitoClient.signUp(username, password);
            setMode("verify");
          }
        }}
      />
      {mode === "verify" ? (
        <div>
          <input
            type="text"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
          <input
            type="submit"
            value="Verification Code"
            onClick={async () => {
              await cognitoClient.confirmRegistration(
                username,
                password,
                verificationCode
              );
              location.reload();
            }}
          />
        </div>
      ) : undefined}

      {!!props.loggedInUser ? (
        <div>
          {" "}
          <input
            type="submit"
            value="Sign Out"
            onClick={() => {
              cognitoClient.signOut();
              location.reload();
            }}
          />
        </div>
      ) : undefined}
    </div>
  );
};

export default Auth;
