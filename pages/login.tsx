import React, { useState } from "react";
import Router from "next/router";

import { CognitoClient } from "../clients/cognito";

const cognitoClient = new CognitoClient();

const LoginPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error2, setError2] = useState("");

  return (
    <div
      style={{
        // vertically and horizontall align
        // credit: https://stackoverflow.com/questions/19461521/how-to-center-an-element-horizontally-and-vertically
        position: "absolute",
        top: "50%",
        left: "50%",
        WebkitTransform: "translateX(-50%) translateY(-50%)",
        transform: "translateX(-50%) translateY(-50%)",
      }}
    >
      <select
        value={mode}
        onChange={(event) => {
          setMode(event.target.value as any);
          setError("");
        }}
      >
        <option value="login">Login</option>
        <option value="signup">Signup</option>
      </select>
      <br />
      <input
        type="text"
        placeholder="email"
        style={{ marginTop: 8 }}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="password"
        style={{ marginTop: 8 }}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <br />
      <input
        type="submit"
        value="Submit"
        style={{ marginTop: 8 }}
        onClick={async () => {
          setError("");
          if (mode === "login") {
            await cognitoClient.authenticateUser(username, password);
            Router.push("/");
          } else {
            try {
              await cognitoClient.signUp(username, password);
            } catch (err) {
              setError(err.message);
              return;
            }
            setMode("verify");
          }
        }}
      />
      <br />
      <span style={{ color: "red", marginTop: 8 }}>{error}</span>
      {mode === "verify" ? (
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
          <br />
          <input
            type="submit"
            value="Verification Code"
            style={{ marginTop: 8 }}
            onClick={async () => {
              setError2("");
              try {
                await cognitoClient.confirmRegistration(
                  username,
                  password,
                  verificationCode
                );
                Router.push("/");
              } catch (err) {
                setError2(err.message);
              }
            }}
          />
          <br />
          <span style={{ color: "red", marginTop: 8 }}>{error2}</span>
        </div>
      ) : undefined}
    </div>
  );
};

export default LoginPage;
