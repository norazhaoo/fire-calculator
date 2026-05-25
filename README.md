# FIRE Calculator

FIRE Calculator is a planned personal finance tool for estimating the path to
financial independence and early retirement. FIRE stands for Financial
Independence, Retire Early.

The goal is to help users answer practical questions:

- How much money do I need before I can retire?
- How many years might it take to reach that number?
- How do savings rate, expenses, investment return, inflation, and withdrawal
  rate change the result?
- What monthly contribution would close the gap faster?

## MVP Scope

The first version should focus on a clear calculator experience:

- Annual income
- Annual expenses
- Current invested assets
- Monthly or annual contributions
- Expected annual investment return
- Expected annual inflation
- Safe withdrawal rate
- Target FIRE number
- Estimated years to FIRE

## Core Ideas

The calculator can start with a simple model:

- FIRE number = annual expenses / safe withdrawal rate
- Annual portfolio growth = current assets and future contributions compounded
  by expected return
- Real return can be estimated by adjusting nominal return for inflation
- Years to FIRE is the first year where projected assets meet or exceed the
  FIRE number

The model should be transparent. Users should be able to see the assumptions
behind the result instead of treating the number as a black box.

## Future Features

Possible additions after the MVP:

- Coast FIRE, Lean FIRE, Fat FIRE, and Barista FIRE scenarios
- Year-by-year projection table
- Chart of projected net worth over time
- Currency and locale settings
- Scenario comparison
- Tax and account-type assumptions
- Saved plans

## Development Notes

No application stack has been chosen yet. Keep the first implementation small,
testable, and focused on the calculation model before expanding the interface.
