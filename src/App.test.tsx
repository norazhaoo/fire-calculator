import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";
import App from "./App";

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("starts with tier selection before the estimator", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "你想先估算哪一种 FIRE 生活？" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /保底版/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /安全版/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /富足版/ })).toBeInTheDocument();
});

it("selects a tier and opens a light estimator home with age and three main cards", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));

  expect(screen.getByRole("heading", { name: "安全版 FIRE 估算" })).toBeInTheDocument();
  expect(screen.getByLabelText("当前年龄")).toHaveValue(30);
  expect(screen.getByRole("button", { name: "编辑收入" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "编辑资产和投资" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "编辑支出" })).toBeInTheDocument();
});

it("edits income and assets from section cards and returns to updated home summaries", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑收入" }));

  expect(screen.getByRole("heading", { name: "收入" })).toBeInTheDocument();
  const salaryInput = screen.getByLabelText("固定工资（每月）");
  expect(screen.queryByRole("button", { name: /固定工资/ })).not.toBeInTheDocument();
  await user.clear(salaryInput);
  await user.type(salaryInput, "30000");
  await user.click(screen.getByRole("button", { name: "返回估算首页" }));

  expect(screen.getByText("年收入：¥360,000")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "编辑资产和投资" }));
  expect(screen.getByRole("heading", { name: "资产和投资" })).toBeInTheDocument();
  const cashInput = screen.getByLabelText("现金/活期金额");
  await user.clear(cashInput);
  await user.type(cashInput, "200000");
  await user.click(screen.getByRole("button", { name: "返回估算首页" }));

  expect(screen.getByText("可投资资产：¥200,000")).toBeInTheDocument();
});

it("shows expense categories directly and expands itemized details only on demand", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑支出" }));

  expect(screen.getByRole("heading", { name: "支出" })).toBeInTheDocument();
  expect(screen.getByLabelText("日常吃喝用估算金额")).toBeInTheDocument();
  expect(screen.getByLabelText("日常吃喝用金额周期")).toBeInTheDocument();
  expect(screen.getByLabelText("居住估算金额")).toBeInTheDocument();
  expect(screen.queryByLabelText("在家吃饭/普通外食")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "展开日常吃喝用明细" }));

  expect(screen.getByLabelText("在家吃饭/普通外食")).toBeInTheDocument();
  expect(screen.getByLabelText("在家吃饭/普通外食周期")).toBeInTheDocument();
});

it("scrolls back to the top when opening a section from the estimator home", async () => {
  const user = userEvent.setup();
  const scrollSpy = vi.mocked(window.scrollTo);
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  scrollSpy.mockClear();
  await user.click(screen.getByRole("button", { name: "编辑支出" }));

  expect(scrollSpy).toHaveBeenCalledWith(0, 0);
});

it("uses the age from estimator home when generating the report", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  const ageInput = screen.getByLabelText("当前年龄");
  await user.clear(ageInput);
  await user.type(ageInput, "42");
  await user.click(screen.getByRole("button", { name: "编辑资产和投资" }));
  const cashInput = screen.getByLabelText("现金/活期金额");
  await user.clear(cashInput);
  await user.type(cashInput, "20000000");
  await user.click(screen.getByRole("button", { name: "返回估算首页" }));
  await user.click(screen.getByRole("button", { name: "生成报告" }));

  expect(screen.getByRole("heading", { name: "你的 FIRE 估算" })).toBeInTheDocument();
  expect(screen.getByText("预计 FIRE 年龄：42 岁")).toBeInTheDocument();
});

it("shows sources and FIRE-after expense adjustments on the review page", async () => {
  const user = userEvent.setup();
  render(<App />);

  await openReview(user, /安全版/);

  expect(screen.getByRole("heading", { name: "安全版 Review" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "切换版本" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "高级假设" })).toBeInTheDocument();
  expect(screen.getByLabelText("安全提现率")).toBeInTheDocument();
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
  await user.click(screen.getByRole("button", { name: "编辑收入" }));
  const salaryInput = screen.getByLabelText("固定工资（每月）");
  await user.clear(salaryInput);
  await user.type(salaryInput, "12000");
  await user.click(screen.getByRole("button", { name: "返回估算首页" }));
  await user.click(screen.getByRole("button", { name: "Review 假设" }));
  await user.click(screen.getByRole("button", { name: "切换到富足版" }));

  expect(screen.getByRole("heading", { name: "富足版 FIRE 估算" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "编辑收入" }));
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
  await user.click(screen.getByRole("button", { name: "Review 假设" }));
}
