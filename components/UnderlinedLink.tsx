import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  pathName: string;
  title: string;
};

const UnderlinedLink = (props: Props) => {
  const router = useRouter();
  return (
    <Link href={props.pathName}>
      <a
        style={{
          textDecoration:
            router.pathname === props.pathName ? "underline" : "none",
          color: "inherit",
          marginLeft: "20px",
          fontWeight: 600,
        }}
      >
        {props.title}
      </a>
    </Link>
  );
};

export default UnderlinedLink;
