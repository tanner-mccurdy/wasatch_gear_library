// Postgres rejects non-numeric values for an int column, so check first
function parseId(value) {
    return /^\d+$/.test(value) ? Number(value) : null
}

module.exports = { parseId }
