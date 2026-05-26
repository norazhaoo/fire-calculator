# FIRE Calculator

FIRE Calculator is a lifestyle-first calculator for estimating financial
independence and early retirement. The app is aimed at Chinese users who want to
describe income, assets, and real-life spending instead of starting from finance
jargon.

## Product Shape

Users choose one scenario first:

- `保底版`: necessary life, faster freedom, fewer upgrades.
- `安全版`: stable life with medical, family, and education buffers.
- `富足版`: wider choice set for travel, healthcare, education, and family support.

After a scenario is chosen, users land on a light estimator home:

- Current age is editable at the top of the page.
- Three primary cards summarize income, assets and investment, and expenses.
- Users can jump into any card, return to the estimator home, then review or
  generate a report without walking through a long linear questionnaire.

The three editable sections are:

- Income: fixed salary, bonus, part-time work, business income, rent, investment
  cash flow, and other income. Each source is shown in one compact section and
  can be marked as continuing after FIRE.
- Assets and investment: cash, low-risk assets, medium-risk assets, high-risk
  assets, home, and investment property. Each bucket has amount, expected return,
  and whether it counts toward FIRE assets.
- Expenses: each category supports a quick estimate or expanded itemized
  details. Every amount can be entered as daily, weekly, monthly, or annual and
  is annualized by the model. Categories include daily life, housing, transport,
  entertainment, travel, large purchases, medical, family responsibility,
  children, and buffer.
- Review: current expenses default to FIRE-after expenses, but each category can
  be adjusted for retirement differences.

Every input has helper copy explaining what the field means, so users do not
need to understand finance terms before trying an estimate.

## Calculation Model

Inputs are separated for usability, but calculation is linked:

```text
Annual contribution = max(0, pre-FIRE annual income - pre-FIRE annual expense)
Net FIRE expense = max(0, FIRE-after annual expense - FIRE-after continuing income)
FIRE target = net FIRE expense / safe withdrawal rate + one-time reserves
Years to FIRE = current investable assets + annual contribution + portfolio growth
```

Investment return is weighted from included asset buckets. One-time reserves
cover emergency months, major illness and recovery, parent care, and child
education reserves.

## Local Development

```bash
npm install
npm run dev
```

Validation:

```bash
npm test
npm run typecheck
npm run build
```
