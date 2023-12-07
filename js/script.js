document.addEventListener("DOMContentLoaded", function () {
    // ดึง Element จาก ID
    var myDIV = document.getElementById("myDIV");
    var row1 = document.getElementById("row1")

    // สร้างตัวแปรเพื่อเก็บรายละเอียดของจังหวัดที่ถูกเลือก
    var selectedProvince = null;

    // รายชื่อ ID ของจังหวัด
    var provinceIDs = ["Mae Hong Son", "Chumphon", "Nakhon Si Thammarat", "Phuket", "Phangnga", "Ranong", "Surat Thani", "Krabi", "Patthalung",
"Satun", "Songkhla", "Trang", "Yala", "Chiang Rai", "Chiang Mai", "Lampang", "Lamphun", "Nan", "Phayao", "Phrae", "Phitsanulok", "Sukhothai",
"Uttaradit", "Kanchanaburi", "Kamphaeng Phet", "Phichit", "Phetchabun", "Suphan Buri", "Tak", "Uthai Thani", "Ang Thong", "Chai Nat", "Lop Buri", 
"Nakhon Nayok", "Prachin Buri", "Nakhon Sawan", "Phra Nakhon Si Ayutthaya", "Pathum Thani", "Sing Buri", "Saraburi", "Bangkok Metropolis", "Nonthaburi", 
"Nakhon Pathom", "Phetchaburi", "Prachuap Khiri Khan", "Ratchaburi", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Si Sa Ket", "Ubon Ratchathani", 
"Amnat Charoen", "Yasothon", "Chon Buri", "Chachoengsao", "Chanthaburi", "Sa Kaeo", "Rayong", "Trat", "Buri Ram", "Chaiyaphum", "Khon Kaen", "Kalasin", 
"Maha Sarakham", "Nakhon Ratchasima", "Roi Et", "Surin", "Loei", "Nong Khai", "Sakon Nakhon", "Udon Thani", "Nong Bua Lam Phu", "Nakhon Phanom", "Mukdahan",
"Narathiwat", "Pattani", "Bueng Kan" ];

    // ใช้ forEach เพื่อเพิ่ม Event Listener สำหรับคลิกในแต่ละจังหวัด
    provinceIDs.forEach(function (provinceID) {
        var province = document.getElementById("map " + provinceID);

        province.addEventListener("click", function (event) {
            event.preventDefault();

            // ถ้ามีจังหวัดที่ถูกเลือกอยู่แล้ว ให้ยกเลิกการเลือก
            if (selectedProvince) {
                selectedProvince.style.fill = "black";
            }

            // ตั้งค่าจังหวัดที่ถูกเลือกและเปลี่ยนสี
            selectedProvince = province;
            selectedProvince.style.fill = "rgb(250, 5, 5)";

            myDIV.innerHTML = "<h3> " + provinceID + "</h3>";
            row1.innerHTML = "<div>" + provinceID + "</div>";
        });
    });
});
