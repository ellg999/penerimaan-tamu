function loadAppointments() {
    const tableBody = document.getElementById('appointmentsTable');
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    tableBody.innerHTML = '';

    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;" class="soft-text">Belum ada data kunjungan.</td></tr>';
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
             actions = `<i class="soft-text">Tamu Hadir di Lobi</i>`;
        } else {
             actions = `<i class="soft-text">Dibatalkan: ${app.cancelReason || '-'}</i>`;
        }

        const row = `<tr>
            <td>${app.id}</td>
            <td><strong>${app.name}</strong> ${app.category === 'Siswa' ? '<br><small class="soft-text">NISN: '+app.nisn+'</small>' : ''}</td>
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
    
    // Manajemen Pembatalan: Wajib mengisi alasan jika dibatalkan
    if(newStatus === 'Cancelled') {
        let reason = prompt('Masukkan alasan pembatalan kunjungan:');
        if(reason === null || reason.trim() === '') return; 
        appointments[index].cancelReason = reason;
    }
    
    appointments[index].status = newStatus;
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

window.onload = loadAppointments;
