const categorySelect = document.getElementById('guestCategory');
const nisnGroup = document.getElementById('nisnGroup');
const nisnInput = document.getElementById('guestNISN');

// Memunculkan kolom NISN jika kategori tamu adalah Siswa
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

document.getElementById('guestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('guestName').value;
    const category = document.getElementById('guestCategory').value;
    const nisn = document.getElementById('guestNISN').value;
    const host = document.getElementById('hostName').value;
    const datetime = document.getElementById('visitTime').value;

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // Validasi Pencegahan Jadwal Ganda
    const isConflict = appointments.some(app => app.host === host && app.datetime === datetime && app.status !== 'Cancelled');
    if (isConflict) {
        alert('Jadwal bentrok: Slot waktu untuk ' + host + ' sudah terisi. Silakan pilih waktu lain.');
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

    alert('Jadwal diajukan! Menunggu Approval dari Host.');
    this.reset();
    nisnGroup.classList.add('hidden');
});

function checkStatus() {
    const nameToCheck = document.getElementById('checkName').value.trim().toLowerCase();
    const resultBox = document.getElementById('statusResult');
    const qrBox = document.getElementById('qrcode');
    
    resultBox.classList.add('hidden');
    qrBox.innerHTML = ''; 

    if (!nameToCheck) return;

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.reverse().find(app => app.name.toLowerCase() === nameToCheck);

    if (appointment) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `Status: <span style="color: ${appointment.status === 'Approved' ? '#38b000' : '#ffaa00'}">${appointment.status}</span><br>
                               Waktu: ${new Date(appointment.datetime).toLocaleString()}<br>
                               Host: ${appointment.host}`;
        
        // Menerbitkan QR Code jika status telah di-Approve
        if (appointment.status === 'Approved') {
            const qrData = `ID:${appointment.id}|Nama:${appointment.name}`;
            new QRCode(qrBox, { text: qrData, width: 140, height: 140 });
            
            let caption = document.createElement("p");
            caption.innerHTML = "<small class='soft-text' style='margin-top:10px;'>QR Code ini adalah tiket masuk digital Anda.</small>";
            qrBox.appendChild(caption);
        }
    } else {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = 'Data tidak ditemukan.';
    }
}
