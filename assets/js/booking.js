// booking.js - Final Fixed (Validasi + Tampilan Ongkir Halaman Utama + Struk Rapi)

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. SETUP ELEMENT HTML (Inject Popup & Baris Ongkir) ---
    
    // A. Inject HTML Popup Struk
    const modalHTML = `
    <div id="bookingModal" class="modal-overlay">
      <div class="booking-card-wrapper">
        <div class="receipt-paper">
          <div class="receipt-header">
            <h2>C&C RENT</h2>
            <span>OFFICIAL RECEIPT</span><br>
            <small id="receiptId">#INV-0000</small>
          </div>
          
          <div class="receipt-body" id="receiptContent">
            </div>

          <div class="status-badge">MENUNGGU KONFIRMASI ADMIN</div>

          <div class="barcode">
            ||| || ||| || |||| |||
            <br>TERIMA KASIH
          </div>
        </div>
        <button class="btn-close-card" onclick="tutupModal()">Selesai</button>
        <p class="success-text">Silakan Screenshot & kirim ke WhatsApp Admin</p>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // B. Setup Variabel Utama
    const sewaForm = document.getElementById('sewaForm');
    const inputDurasi = document.getElementById('durasi');
    const inputMetode = document.getElementById('metode');
    const inputTanggal = document.getElementById('tanggal');
    const inputWa = document.getElementById('wa');
    const displaySubTotal = document.getElementById('subTotal');
    const displayTotal = document.getElementById('totalBayar');
    const modal = document.getElementById('bookingModal');

    const namaMotor = sewaForm.getAttribute('data-motor');
    const hargaPerHari = parseInt(sewaForm.getAttribute('data-harga'));
    const BIAYA_ANTAR = 100000;

    // C. Inject Baris Ongkir di Halaman Utama (Bawah Subtotal)
    // Kita cari elemen summary di halaman
    const totalSection = document.querySelector('.total-section');
    const rowSubTotal = totalSection.querySelector('.row'); // Baris subtotal yang sudah ada
    
    // Buat elemen baru untuk Ongkir
    const rowOngkir = document.createElement('div');
    rowOngkir.className = 'row';
    rowOngkir.id = 'rowOngkirDisplay';
    rowOngkir.style.display = 'none'; // Default sembunyi
    rowOngkir.style.color = '#e74c3c'; // Merah
    rowOngkir.style.fontSize = '14px';
    rowOngkir.style.marginBottom = '10px';
    rowOngkir.innerHTML = `<span>Biaya Antar</span><span>+ Rp ${BIAYA_ANTAR.toLocaleString('id-ID')}</span>`;
    
    // Masukkan elemen ongkir SETELAH baris subtotal
    rowSubTotal.after(rowOngkir);

    // --- 2. VALIDASI & LOGIKA ---

    // Set minimal tanggal = hari ini
    const today = new Date().toISOString().split('T')[0];
    inputTanggal.setAttribute('min', today);

    // Fungsi Hitung Real-time
    function hitungTotal() {
        let durasi = parseInt(inputDurasi.value) || 0;
        if (durasi < 0) durasi = 0;

        let isDelivery = inputMetode.value === "Diantar ke Lokasi";
        let ongkir = isDelivery ? BIAYA_ANTAR : 0;

        let subTotal = durasi * hargaPerHari;
        let grandTotal = subTotal + ongkir;
        
        // Update Angka di Halaman
        if(displaySubTotal) displaySubTotal.innerText = subTotal.toLocaleString('id-ID');
        if(displayTotal) displayTotal.innerText = grandTotal.toLocaleString('id-ID');

        // Toggle Tampilan Baris Ongkir di Halaman Utama
        if (isDelivery) {
            rowOngkir.style.display = 'flex'; // Munculkan baris ongkir
        } else {
            rowOngkir.style.display = 'none'; // Sembunyikan
        }
    }

    // Event Listeners
    inputDurasi.addEventListener('input', hitungTotal);
    inputMetode.addEventListener('change', hitungTotal);
    
    // Jalankan sekali saat load
    hitungTotal();

    // --- 3. PROSES SUBMIT BOOKING ---
    sewaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // A. Validasi Durasi
        if (inputDurasi.value <= 0) {
            alert("Durasi sewa minimal 1 hari!");
            return;
        }

        // B. Validasi No HP (Regex: Angka, 10-15 digit)
        const waPattern = /^[0-9]{10,15}$/;
        if (!waPattern.test(inputWa.value)) {
            alert("Masukkan nomor WhatsApp yang valid (Hanya angka, min 10 digit)!");
            return;
        }

        // C. Ambil Data Final
        let nama = document.getElementById('nama').value;
        let noWa = inputWa.value;
        let rawDate = inputTanggal.value;
        let durasiValue = inputDurasi.value;
        let isDelivery = inputMetode.value === "Diantar ke Lokasi";
        let ongkir = isDelivery ? BIAYA_ANTAR : 0;
        let totalSewa = durasiValue * hargaPerHari;
        let grandTotal = totalSewa + ongkir;
        let randomId = Math.floor(Math.random() * 90000) + 10000;

        // D. Generate Isi Struk Popup
        let htmlStruk = `
            <div class="receipt-item"><span>Customer:</span> <strong>${nama.toUpperCase()}</strong></div>
            <div class="receipt-item"><span>No. HP:</span> <strong>${noWa}</strong></div>
            <hr style="border: 0.5px dashed #ccc; margin: 5px 0;">
            <div class="receipt-item"><span>Unit:</span> <strong>${namaMotor}</strong></div>
            <div class="receipt-item"><span>Tgl Sewa:</span> <strong>${rawDate}</strong></div>
            <div class="receipt-item"><span>Durasi:</span> <strong>${durasiValue} Hari</strong></div>
            <div class="receipt-item"><span>Metode:</span> <strong>${isDelivery ? 'DELIVERY' : 'PICKUP'}</strong></div>
            
            <div class="receipt-total" style="margin-top:10px; border-top: 2px dashed #000; padding-top:10px;">
              <div class="receipt-item"><span>Subtotal:</span> <span>Rp ${totalSewa.toLocaleString('id-ID')}</span></div>
              ${isDelivery ? `<div class="receipt-item" style="color:#e74c3c;"><span>Biaya Antar:</span> <span>+ Rp ${ongkir.toLocaleString('id-ID')}</span></div>` : ''}
              <div class="receipt-item" style="font-size: 18px; margin-top: 5px;"><strong>TOTAL:</strong> <strong>Rp ${grandTotal.toLocaleString('id-ID')}</strong></div>
            </div>
            <p style="font-size: 10px; margin-top: 10px; font-style: italic; color: #666;">*Tunjukan bukti ini ke admin untuk konfirmasi.</p>
        `;

        // E. Tampilkan Modal
        document.getElementById('receiptId').innerText = "#INV-" + randomId;
        document.getElementById('receiptContent').innerHTML = htmlStruk;
        modal.classList.add('show');
    });
});

// Fungsi Tutup Modal
function tutupModal() {
    document.getElementById('bookingModal').classList.remove('show');
}