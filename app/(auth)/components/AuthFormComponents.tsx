import styled from "@emotion/styled";

export const Container = styled.div(() => ({
  maxWidth: 400,
  margin: "40px auto",
  padding: "20px",
}));

export const Title = styled.h1(() => ({
  textAlign: "center",
  marginBottom: 30,
}));

export const Form = styled.form(() => ({
  display: "flex",
  flexDirection: "column",
  gap: 20,
}));

export const FormGroup = styled.div(() => ({
  display: "flex",
  flexDirection: "column",
}));

export const Label = styled.label(() => ({
  marginBottom: 5,
  fontWeight: "600",
}));

export const Input = styled.input(() => ({
  padding: 10,
  fontSize: 16,
  border: "1px solid #ccc",
  borderRadius: 4,
}));

export const Button = styled.button(() => ({
  padding: 12,
  fontSize: 16,
  fontWeight: "600",
  backgroundColor: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#333",
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
}));

export const ErrorMessage = styled.div(() => ({
  color: "red",
  textAlign: "center",
  marginBottom: 10,
}));

export const SuccessMessage = styled.div(() => ({
  color: "green",
  textAlign: "center",
  marginBottom: 10,
}));

export const LinkText = styled.p(() => ({
  textAlign: "center",
  marginTop: 20,
  "& a": {
    color: "#000",
    fontWeight: "600",
  },
}));

export const WarningMessage = styled.div(() => ({
  backgroundColor: "#fff3cd",
  color: "#856404",
  padding: 15,
  borderRadius: 4,
  marginBottom: 20,
  border: "1px solid #ffeeba",
}));

export const HelpText = styled.p(() => ({
  fontSize: 14,
  color: "#666",
  marginTop: 5,
}));

export const PasswordRequirements = styled.div(() => ({
  fontSize: 14,
  color: "#666",
  marginTop: 5,
  "& ul": {
    margin: 0,
    paddingLeft: 20,
  },
}));
