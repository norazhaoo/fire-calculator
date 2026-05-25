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

it("shows answer sources on the review page", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "Review 假设" }));

  expect(screen.getByRole("heading", { name: "安全版 Review" })).toBeInTheDocument();
  expect(screen.getAllByText("default").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "生成报告" })).toBeInTheDocument();
});

it("inherits answers when upgrading from baseline to abundant", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /保底版/ }));
  await user.click(screen.getByRole("button", { name: "Review 假设" }));
  await user.click(screen.getByRole("button", { name: "切换到富足版" }));

  expect(screen.getByRole("heading", { name: "富足版生活问卷" })).toBeInTheDocument();
  expect(screen.getByLabelText("私立医疗或跨城就医预算")).toBeInTheDocument();
});

it("goes directly to review when downgrading from abundant to baseline", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /富足版/ }));
  await user.click(screen.getByRole("button", { name: "Review 假设" }));
  await user.click(screen.getByRole("button", { name: "切换到保底版" }));

  expect(screen.getByRole("heading", { name: "保底版 Review" })).toBeInTheDocument();
  expect(screen.getAllByText("derived").length).toBeGreaterThan(0);
});
