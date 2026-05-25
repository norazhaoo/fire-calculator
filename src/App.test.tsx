import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

it("starts with tier selection before the questionnaire", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "你想先估算哪一种 FIRE 生活？" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /保底版/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /安全版/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /富足版/ })).toBeInTheDocument();
});

it("selects a tier and opens the questionnaire", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));

  expect(screen.getByRole("heading", { name: "安全版生活问卷" })).toBeInTheDocument();
});

it("allows users to answer visible questionnaire fields", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  const foodInput = screen.getByLabelText("每天吃饭预算");

  await user.clear(foodInput);
  expect(foodInput).toHaveValue(null);

  await user.type(foodInput, "120");

  expect(foodInput).toHaveValue(120);
  expect(screen.getByRole("button", { name: "Review 假设" })).toBeInTheDocument();
});
