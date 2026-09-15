// Simulasi Kategori Tamu (Munculkan NISN jika Siswa)
const categorySelect = document.getElementById('guestCategory');
const nisnGroup = document.getElementById('nisnGroup');
const nisnInput = document.getElementById('guestNISN');

categorySelect.addEventListener('change', function() {
    if (this.value === 'Siswa') {
        nisnGroup.classList.remove('hidden');
        nisnInput.setAttribute('required', 'required');
    } else {
        nisnGroup.classList.add('hidden');
        nisnInput.removeAttribute('required');
        nisnInput.value = '';
    }
});

// Pendaftaran Jadwal Baru
document.getElementById('guestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('guestName').value;
    const category = document.getElementById('guestCategory').value;
    const nisn = document.getElementById('guestNISN').value;
    const host = document.getElementById('hostName').value;
    const datetime = document.getElementById('visitTime').value;

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // Validasi Jadwal Ganda (Host dan Waktu yang sama persis)
    const isConflict = appointments.some(app => app.host === host && app.datetime === datetime && app.status !== 'Cancelled');
    if (isConflict) {
        alert('Maaf, jadwal pada waktu tersebut untuk host ' + host + ' sudah terisi. Silakan pilih waktu lain.');
        return;
    }

    const newAppointment = {
        id: 'REQ-' + Date.now().toString().slice(-5),
        name: name,
        category: category,
        nisn: nisn,
        host: host,
        datetime: datetime,
        status: 'Pending'
    };

    appointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    alert('Jadwal berhasil diajukan dengan status PENDING. Menunggu persetujuan Host.');
    this.reset();
    nisnGroup.classList.add('hidden');
});

// Cek Status & QR
function checkStatus() {
    const nameToCheck = document.getElementById('checkName').value.trim().toLowerCase();
    const resultBox = document.getElementById('statusResult');
    const qrBox = document.getElementById('qrcode');
    
    resultBox.classList.add('hidden');
    qrBox.innerHTML = ''; // bersihkan QR lama

    if (!nameToCheck) return;

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.reverse().find(app => app.name.toLowerCase() === nameToCheck);

    if (appointment) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `Status Anda: <span style="color: ${appointment.status === 'Approved' ? 'green' : 'orange'}">${appointment.status}</span><br>
                               Waktu: ${new Date(appointment.datetime).toLocaleString()}<br>
                               Bertemu: ${appointment.host}`;
        
        // Jika Approved, Generate QR Code Digital Ticket
        if (appointment.status === 'Approved') {
            const qrData = `ID:${appointment.id}|Nama:${appointment.name}|Host:${appointment.host}`;
            new QRCode(qrBox, {
                text: qrData,
                width: 128,
                height: 128
            });
            let caption = document.createElement("p");
            caption.innerHTML = "<small>Tunjukkan QR ini ke Resepsionis saat tiba.</small>";
            qrBox.appendChild(caption);
        }
    } else {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = 'Data tidak ditemukan.';
    }
}
