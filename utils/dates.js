const dayjs = require("dayjs")

// Today's date as "YYYY-MM-DD", the same format date columns come back in
function today() {
    return dayjs().format("YYYY-MM-DD")
}

// "Due today", "Due in 3 days" or "Overdue by 2 days", counted from today
function dueLabel(dueOn, todayDate) {
    const days = dayjs(dueOn).diff(dayjs(todayDate), "day")
    if (days === 0) {
        return "Due today"
    }
    if (days > 0) {
        return `Due in ${days} ${days === 1 ? "day" : "days"}`
    }
    return `Overdue by ${-days} ${days === -1 ? "day" : "days"}`
}

module.exports = { today, dueLabel }
