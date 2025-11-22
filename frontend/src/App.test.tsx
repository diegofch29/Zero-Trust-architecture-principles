import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login form when not authenticated", () => {
  render(<App />);
  const loginElement = screen.getByText(/Message Board - Login/i);
  expect(loginElement).toBeInTheDocument();
});
