import React, { ReactNode } from "react";
import Head from "next/head";
import Auth from "./Auth";
import { User } from "../interfaces";

type Props = {
  children?: ReactNode;
  title?: string;
  loggedInUser?: User;
};

const Layout = ({
  children,
  title = "This is the default title",
  loggedInUser,
}: Props) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <h1>State Tracker</h1>
      <Auth loggedInUser={loggedInUser} />
      {children}
    </div>
  );
};

export default Layout;
