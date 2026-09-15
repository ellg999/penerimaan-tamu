// ==================== LOGIKA SWITCH VIEW ====================
const viewToggle = document.getElementById('viewToggle');
const guestView = document.getElementById('guestView');
const dashboardView = document.getElementById('dashboardView');
const labelTamu = document.getElementById('labelTamu');
const labelDashboard = document.getElementById('labelDashboard');

// Set label aktif awal
labelTamu.classList.add('active');

viewToggle.addEventListener('change', function() {
    if (this.checked) {
        // Pindah ke Dashboard
        guestView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        labelDashboard.classList.add('active');
        labelTamu.classList.remove('active');
        loadAppointments(); // Refresh tabel saat masuk dashboard
    } else {
        // Pindah ke Portal Tamu
        dashboardView.classList.add('hidden');
        guestView.classList.remove('hidden');
        labelTamu.classList.add('active');
        labelDashboard.classList.remove('active');
    }
});


// ==================== LOGIKA PORTAL TAMU ====================
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
        resultBox.innerHTML = `Status: <strong>${appointment.status}</strong><br>
                               Waktu: ${new Date(appointment.datetime).toLocaleString()}<br>
                               Host: ${appointment.host}`;
        
        // Menerbitkan QR Code jika Approved
        if (appointment.status === 'Approved') {
            const qrData = `ID:${appointment.id}|Nama:${appointment.name}`;
            new QRCode(qrBox, { text: qrData, width: 140, height: 140 });
            
            let caption = document.createElement("p");
            caption.innerHTML = "<small class='soft-text-dark' style='margin-top:10px; display:block;'>Scan tiket ini di Lobi</small>";
            qrBox.appendChild(caption);
        }
    } else {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = 'Data jadwal tidak ditemukan.';
    }
}


// ==================== LOGIKA DASHBOARD ====================
function loadAppointments() {
    const tableBody = document.getElementById('appointmentsTable');
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    tableBody.innerHTML = '';

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;" class="soft-text-dark">Belum ada antrean kunjungan.</td></tr>';
        return;
    }

    appointments.forEach((app, index) => {
        let badgeClass = 'badge-pending';
        if (app.status === 'Approved') badgeClass = 'badge-approved';
        if (app.status === 'Checked-in') badgeClass = 'badge-checkedin';

        let actions = '';
        if (app.status === 'Pending') {
            actions = `<button class="btn-success" onclick="updateStatus(${index}, 'Approved')">Approve</button>
                       <button class="btn-danger" onclick="updateStatus(${index}, 'Cancelled')">Batal</button>`;
        } else if (app.status === 'Approved') {
            actions = `<button class="btn-warning" onclick="updateStatus(${index}, 'Checked-in')">Scan Kehadiran</button>
                       <button class="btn-danger" onclick="updateStatus(${index}, 'Cancelled')">Batal</button>`;
        } else if (app.status === 'Checked-in') {
             actions = `<span class="soft-text-dark">Tamu Hadir</span>`;
        } else {
             actions = `<span class="soft-text-dark">Alasan: ${app.cancelReason || '-'}</span>`;
        }

        const row = `<tr>
            <td>${app.id}</td>
            <td><strong>${app.name}</strong> ${app.category === 'Siswa' ? '<br><small class="soft-text-dark">NISN: '+app.nisn+'</small>' : ''}</td>
            <td>${app.category}</td>
            <td>${app.host}</td>
            <td>${new Date(app.datetime).toLocaleString()}</td>
            <td><span class="${badgeClass}">${app.status}</span></td>
            <td>${actions}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function updateStatus(index, newStatus) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Manajemen Pembatalan dengan alasan
    if(newStatus === 'Cancelled') {
        let reason = prompt('Masukkan alasan pembatalan kunjungan:');
        if(reason === null || reason.trim() === '') return; 
        appointments[index].cancelReason = reason;
    }
    
    appointments[index].status = newStatus;
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments(); // Refresh tabel setelah status berubah
}
