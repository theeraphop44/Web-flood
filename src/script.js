const data = [
    {num:1 , location: 1, waterLevel: "1", status: 2 , time: "3" },
    {num:2 , location: 2, waterLevel: "1", status: 1, time: "3" },
    {num:3 , location: "d", waterLevel: "1", status: "2", time: "3" },
];

const tableBody = document.querySelector('.TableBody');
const tableHead = document.querySelector('.TableHead');

// สร้าง <th> สำหรับแต่ละ property
const headerRow = document.createElement('tr');
Object.keys(data[0]).forEach(key => {
    if (key !== 'num') {
        const headerCell = document.createElement('th');
        headerCell.classList.add('TableCell-head');
        headerCell.innerHTML = `<span class="ButtonBase">${key}</span>`;
        headerRow.appendChild(headerCell);
    }
});

// เพิ่ม <th> ลงใน thead
tableHead.appendChild(headerRow);

// สร้าง <tr> สำหรับแต่ละรายการใน data
data.forEach(item => {
    const row = document.createElement('tr');
    row.classList.add(item.num % 2 === 0 ? 'TableRow-b' : 'TableRow-w');

    // สร้าง <td> สำหรับแต่ละ property โดยไม่รวม 'num'
    Object.entries(item).forEach(([key, value]) => {
        if (key !== 'num') {
            const cell = document.createElement('td');
            cell.classList.add('TableCell-body');
            cell.textContent = value;
            row.appendChild(cell);
        }
    });

    // เพิ่ม <tr> ลงใน tbody
    tableBody.appendChild(row);
});
