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

it("selects a tier and opens the income step", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));

  expect(screen.getByRole("heading", { name: "收入" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /固定工资/ })).toBeInTheDocument();
});

it("opens category detail cards, explains fields, and returns to the overview", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: /固定工资/ }));

  const salaryInput = screen.getByLabelText("固定工资（每月）");
  expect(screen.getAllByText(/稳定工作的税后月收入/).length).toBeGreaterThan(0);

  await user.clear(salaryInput);
  expect(salaryInput).toHaveValue(null);

  await user.type(salaryInput, "30000");
  expect(salaryInput).toHaveValue(30000);
  await user.click(screen.getByRole("button", { name: "返回大类" }));
  expect(screen.getByRole("button", { name: /固定工资/ })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "下一步" }));
  await user.click(screen.getByRole("button", { name: /现金\/活期/ }));
  expect(screen.getAllByText(/随时可用、波动很低的钱/).length).toBeGreaterThan(0);
  await user.click(screen.getByRole("button", { name: "返回大类" }));

  await user.click(screen.getByRole("button", { name: "下一步" }));
  await user.click(screen.getByRole("button", { name: /日常吃喝用/ }));

  const dailyExpenseInput = screen.getByLabelText("日常吃喝用估算金额");
  expect(screen.getByLabelText("日常吃喝用金额周期")).toBeInTheDocument();
  await user.clear(dailyExpenseInput);
  await user.type(dailyExpenseInput, "72000");

  expect(dailyExpenseInput).toHaveValue(72000);
});

it("shows sources and FIRE-after expense adjustments on the review page", async () => {
  const user = userEvent.setup();
  render(<App />);

  await openReview(user, /安全版/);

  expect(screen.getByRole("heading", { name: "安全版 Review" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "切换版本" })).toBeInTheDocument();
  expect(screen.getByText("FIRE 后支出调整")).toBeInTheDocument();
  expect(screen.getAllByText("default").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "生成报告" })).toBeInTheDocument();
});

it("generates a report with cashflow metrics and three-tier comparison", async () => {
  const user = userEvent.setup();
  render(<App />);

  await openReview(user, /安全版/);
  await user.click(screen.getByRole("button", { name: "生成报告" }));

  expect(screen.getByRole("heading", { name: "你的 FIRE 估算" })).toBeInTheDocument();
  expect(screen.getByText("主版本：安全版")).toBeInTheDocument();
  expect(screen.getByText("年度可投资结余")).toBeInTheDocument();
  expect(screen.getByText("FIRE 后持续收入")).toBeInTheDocument();
  expect(screen.getByText("三档对比")).toBeInTheDocument();
  expect(screen.getByText("最大影响项")).toBeInTheDocument();
});

it("inherits fact answers when upgrading from baseline to abundant", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /保底版/ }));
  await user.click(screen.getByRole("button", { name: /固定工资/ }));
  const salaryInput = screen.getByLabelText("固定工资（每月）");
  await user.clear(salaryInput);
  await user.type(salaryInput, "12000");
  await user.click(screen.getByRole("button", { name: "返回大类" }));
  await continueToReview(user);
  await user.click(screen.getByRole("button", { name: "切换到富足版" }));

  expect(screen.getByRole("heading", { name: "收入" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /固定工资/ }));
  expect(screen.getByLabelText("固定工资（每月）")).toHaveValue(12000);
});

it("goes directly to review when downgrading from abundant to baseline", async () => {
  const user = userEvent.setup();
  render(<App />);

  await openReview(user, /富足版/);
  await user.click(screen.getByRole("button", { name: "切换到保底版" }));

  expect(screen.getByRole("heading", { name: "保底版 Review" })).toBeInTheDocument();
  expect(screen.getAllByText("derived").length).toBeGreaterThan(0);
});

async function openReview(user: ReturnType<typeof userEvent.setup>, tierButtonName: RegExp) {
  await user.click(screen.getByRole("button", { name: tierButtonName }));
  await continueToReview(user);
}

async function continueToReview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "下一步" }));
  await user.click(screen.getByRole("button", { name: "下一步" }));
  await user.click(screen.getByRole("button", { name: "下一步" }));
}
