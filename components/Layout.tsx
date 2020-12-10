import React, { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

import SignOutButton from "./SignOutButton";
import LoginButton from "./LoginButton";
import { User } from "../interfaces";
import Dropdown from "./Dropdown";

type Props = {
  children?: ReactNode;
  title?: string;
  loggedInUser?: User;
};

const mainStyle = {
  fontSize: "18px",
  fontFamily: "Inter",
  fontWeight: 400,
  marginTop: "20px",
};

const Layout = ({ children, title = "State Tracker", loggedInUser }: Props) => {
  return (
    <div style={mainStyle}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <header style={{ display: "flex", marginTop: "1.5rem" }}>
        <span
          style={{ fontSize: "18px", paddingBottom: "8px", fontWeight: 600 }}
        >
          State Tracker
        </span>
        <br />
        <nav
          style={{
            marginLeft: "auto",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <Dropdown>
            <span>{loggedInUser ? loggedInUser.email : ""}</span>
            <br />
            <Link href="/">Map</Link>
            <br />
            <Link href="/images">Images</Link>
            <br />
            {loggedInUser ? <SignOutButton /> : <LoginButton />}
          </Dropdown>
        </nav>
      </header>
      {children}
    </div>
  );
};

export default Layout;
