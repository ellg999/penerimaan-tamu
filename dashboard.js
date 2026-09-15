function loadAppointments() {
    const tableBody = document.getElementById('appointmentsTable');
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    tableBody.innerHTML = '';

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Tidak ada data kunjungan.</td></tr>';
        return;
    }

    appointments.forEach((app, index) => {
        let badgeClass = 'badge-pending';
        if (app.status === 'Approved') badgeClass = 'badge-approved';
        if (app.status === 'Checked-in') badgeClass = 'badge-checkedin';

        let actions = '';
        if (app.status === 'Pending') {
            actions = `<button class="btn-success" onclick="updateStatus(${index}, 'Approved')">Approve</button>
                       <button class="btn-danger" onclick="updateStatus(${index}, 'Cancelled')">Tolak</button>`;
        } else if (app.status === 'Approved') {
            actions = `<button class="btn-warning" onclick="updateStatus(${index}, 'Checked-in')">Scan Check-in</button>
                       <button class="btn-danger" onclick="updateStatus(${index}, 'Cancelled')">Batal</button>`;
        } else if (app.status === 'Checked-in') {
             actions = `<i>Tamu telah hadir</i>`;
        } else {
             actions = `<i>Dibatalkan</i>`;
        }

        const row = `<tr>
            <td>${app.id}</td>
            <td>${app.name} ${app.category === 'Siswa' ? '<br><small>NISN: '+app.nisn+'</small>' : ''}</td>
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
    if(newStatus === 'Cancelled') {
        let reason = prompt('Masukkan alasan pembatalan:');
        if(reason === null) return; // User batal ngisi
    }
    
    appointments[index].status = newStatus;
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

function clearData() {
    if(confirm('Hapus semua data simulasi?')) {
        localStorage.removeItem('appointments');
        loadAppointments();
    }
}

// Inisialisasi saat load
window.onload = loadAppointments;
