"use client";

import Link from "next/link";
import { Section } from "../components/Section";

export default function NotFound() {
  return (
    <div>
      <Section>Nothing to see here!</Section>
      <Section>
        <Link href="/">Go to the home page</Link>
      </Section>
    </div>
  );
}
