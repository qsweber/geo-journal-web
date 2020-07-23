import React, { useState } from "react";
import { CognitoClient } from "../clients/cognito";
import { User } from "../interfaces";

const cognitoClient = new CognitoClient();

interface Props {
  loggedInUser: User | undefined;
}

const Auth = (props: Props) => {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  if (!!props.loggedInUser) {
    return (
      <div style={{ float: "right" }}>
        <span>{"User ID: " + props.loggedInUser.id + " "}</span>
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
  }

  return (
    <div>
      <select
        value={mode}
        style={{ marginRight: 8 }}
        onChange={(event) => setMode(event.target.value as any)}
      >
        <option value="login">Login</option>
        <option value="signup">Signup</option>
      </select>
      <input
        type="text"
        placeholder="email"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="password"
        placeholder="password"
        style={{ marginLeft: 8 }}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <input
        type="submit"
        value="Submit"
        style={{ marginLeft: 8 }}
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
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
          <input
            type="submit"
            value="Verification Code"
            style={{ marginLeft: 8 }}
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
    </div>
  );
};

export default Auth;
