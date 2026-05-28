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
  expect(screen.getByRole("button", { name: "编辑收入" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "编辑资产和投资" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  expect(screen.getByRole("button", { name: "编辑支出" })).toHaveAttribute("aria-expanded", "false");
});

it("expands income inline, updates summaries live, and saves it collapsed", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑收入" }));

  expect(screen.getByRole("heading", { name: "安全版 FIRE 估算" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "保存收入" })).toHaveAttribute("aria-expanded", "true");
  const salaryInput = screen.getByLabelText("固定工资（每月）");
  expect(screen.queryByRole("button", { name: /固定工资/ })).not.toBeInTheDocument();
  await user.clear(salaryInput);
  await user.type(salaryInput, "30000");

  expect(screen.getByText("年收入：¥360,000")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "保存收入" }));

  expect(screen.getByRole("button", { name: "编辑收入" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("已保存")).toBeInTheDocument();
  expect(screen.queryByLabelText("固定工资（每月）")).not.toBeInTheDocument();
});

it("opens only one main card editor at a time", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑收入" }));

  expect(screen.getByLabelText("固定工资（每月）")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "编辑资产和投资" }));

  expect(screen.queryByLabelText("固定工资（每月）")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "编辑收入" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "保存资产和投资" })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  expect(screen.getByLabelText("存款多少")).toBeInTheDocument();
  expect(screen.getByLabelText("存款年化收益率")).toBeInTheDocument();
  expect(screen.getByLabelText("投资多少")).toBeInTheDocument();
  expect(screen.getByLabelText("投资年化收益率")).toBeInTheDocument();
  expect(screen.getByLabelText("房产几个")).toBeInTheDocument();
  expect(screen.getByLabelText("房产估值")).toBeInTheDocument();
  expect(screen.queryByLabelText("现金/活期金额")).not.toBeInTheDocument();

  const depositInput = screen.getByLabelText("存款多少");
  await user.clear(depositInput);
  await user.type(depositInput, "100000");
  const depositRateInput = screen.getByLabelText("存款年化收益率");
  await user.clear(depositRateInput);
  await user.type(depositRateInput, "3");
  const investmentInput = screen.getByLabelText("投资多少");
  await user.clear(investmentInput);
  await user.type(investmentInput, "200000");
  const investmentRateInput = screen.getByLabelText("投资年化收益率");
  await user.clear(investmentRateInput);
  await user.type(investmentRateInput, "8");
  const propertyInput = screen.getByLabelText("房产几个");
  await user.clear(propertyInput);
  await user.type(propertyInput, "3");
  const propertyValueInput = screen.getByLabelText("房产估值");
  await user.clear(propertyValueInput);
  await user.type(propertyValueInput, "5000000");

  expect(screen.getByText("可投资资产：¥300,000")).toBeInTheDocument();
  expect(screen.getByText("预期收益率：6.3%")).toBeInTheDocument();
});

it("shows expense categories directly and expands itemized details only on demand", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑支出" }));

  expect(screen.getByRole("heading", { name: "安全版 FIRE 估算" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "保存支出" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByLabelText("日常吃喝用估算金额")).toBeInTheDocument();
  expect(screen.getByLabelText("日常吃喝用金额周期")).toBeInTheDocument();
  expect(screen.getByLabelText("居住估算金额")).toBeInTheDocument();
  expect(screen.queryByLabelText("在家吃饭/普通外食")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "展开日常吃喝用明细" }));

  expect(screen.getByLabelText("在家吃饭/普通外食")).toBeInTheDocument();
  expect(screen.getByLabelText("在家吃饭/普通外食周期")).toBeInTheDocument();
});

it("marks the saved section while leaving the other sections editable", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑支出" }));
  await user.click(screen.getByRole("button", { name: "保存支出" }));

  expect(screen.getByText("已保存")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "编辑收入" })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "编辑资产和投资" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  expect(screen.getByRole("button", { name: "编辑支出" })).toHaveAttribute("aria-expanded", "false");
});

it("uses the age from estimator home when generating the report", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  const ageInput = screen.getByLabelText("当前年龄");
  await user.clear(ageInput);
  await user.type(ageInput, "42");
  await user.click(screen.getByRole("button", { name: "编辑资产和投资" }));
  const depositInput = screen.getByLabelText("存款多少");
  await user.clear(depositInput);
  await user.type(depositInput, "20000000");
  await user.click(screen.getByRole("button", { name: "保存资产和投资" }));
  await user.click(screen.getByRole("button", { name: "生成报告" }));

  expect(screen.getByRole("heading", { name: "你的 FIRE 估算" })).toBeInTheDocument();
  expect(screen.getByText("预计 FIRE 年龄：42 岁")).toBeInTheDocument();
});

it("keeps property value out of investable assets and reports it as a note", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /安全版/ }));
  await user.click(screen.getByRole("button", { name: "编辑资产和投资" }));
  const propertyInput = screen.getByLabelText("房产几个");
  await user.clear(propertyInput);
  await user.type(propertyInput, "2");
  const propertyValueInput = screen.getByLabelText("房产估值");
  await user.clear(propertyValueInput);
  await user.type(propertyValueInput, "4200000");
  await user.click(screen.getByRole("button", { name: "保存资产和投资" }));

  expect(screen.getByText("可投资资产：¥0")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "生成报告" }));

  expect(
    screen.getByText(
      "已记录房产 2 套，估值 ¥4,200,000，未计入 FIRE 可投资资产；如果未来出租或出售，可以再做高级版估算。"
    )
  ).toBeInTheDocument();
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
  await user.click(screen.getByRole("button", { name: "保存收入" }));
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
