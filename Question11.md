# Question 11: Third-Party Library

## Library

**Day.js** (version 1.11.23)

- Website and docs: https://day.js.org/
- npm: https://www.npmjs.com/package/dayjs
- Source: https://github.com/iamkun/dayjs

Installed with `npm i dayjs`.

## Why I picked it

Before, the due badges showed raw dates like "Due 2026-10-30". To know whether that was soon, you had to work it out from today's date. I wanted a user friendly way to implement that fucntion

Counting the days between two dates by hand with JavaScript's `Date` is easy to get wrong:

- `new Date("2026-10-30")` is read as midnight UTC, not local time.
- Subtracting two dates gives milliseconds, which then have to be converted to days and rounded.
- Daylight saving time can push that result off by an hour.

Day.js solves this in one line: `dayjs(dueOn).diff(dayjs(today), "day")` reads both `YYYY-MM-DD` strings as local dates and returns whole days.

## Files that use it


| `utils/dates.js`  
| `views/partials/components/due-badge.ejs` 
| `app.js`
| `controllers/Checkout.js` 
| `controllers/Gear.js` 
| `controllers/Member.js` 

## Documentation I read

- Installation in Node.js: https://day.js.org/docs/en/installation/node-js
- Parsing a date string: https://day.js.org/docs/en/parse/string
- Formatting dates: https://day.js.org/docs/en/display/format
- Difference between two dates: https://day.js.org/docs/en/display/difference
