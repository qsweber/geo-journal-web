import React from "react";
import { PasswordRequirements } from "../../app/(auth)/components/AuthFormComponents";

export const PasswordRequirementsList: React.FC = () => {
  return (
    <PasswordRequirements>
      Password must contain:
      <ul>
        <li>At least 8 characters</li>
        <li>At least one uppercase letter</li>
        <li>At least one lowercase letter</li>
        <li>At least one number</li>
        <li>At least one special character</li>
      </ul>
    </PasswordRequirements>
  );
};
