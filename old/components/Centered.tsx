import React, { ReactNode } from "react";
import Head from "next/head";

type Props = {
  children?: ReactNode;
  title: string;
};

const Centered = ({ children, title }: Props) => {
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
      <Head>
        <title>{title}</title>
      </Head>
      {children}
    </div>
  );
};

export default Centered;
