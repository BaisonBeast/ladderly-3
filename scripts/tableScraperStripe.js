const table = document.querySelector("table")
const rows = Array.from(table.rows)

const data = rows.slice(1).map((row) => {
  const cells = row.cells
  return {
    amount: cells[1].innerText,
    email: cells[5].innerText,
    // note: date includes time data to the minute
    // so, it's like a timestamp
    date: cells[6].innerText,
  }
})

console.log(JSON.stringify(data, null, 2))
