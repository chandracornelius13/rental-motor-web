// booking.js - Logic Hybrid dengan Biaya Antar (Ongkir)

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. INJECT HTML POPUP (Struk/Receipt)
    // Kita siapkan tempat kosong di dalam struk untuk rincian (akan diisi saat submit)
    const modalHTML = `
    <div id="bookingModal" class="modal-overlay">
      <div class="booking-card-wrapper">
        <div class="receipt-paper">
          <div class="receipt-header">
            <h2>C&C RENT</h2>
            <span>OFFICIAL RECEIPT</span><br>
            <span id="receiptId">#INV-0000</span>
          </div>
          
          <div class="receipt-body" id="receiptContent">
            </div>

          <div class="barcode">
            ||| || ||| || |||| |||
            <br>TERIMA KASIH
          </div>
        </div>
        <button class="btn-close-card" onclick="tutupModal()">Selesai</button>
        <p class="success-text">Silakan Screenshot bukti ini</p>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 2. VARIABEL UTAMA
    const sewaForm = document.getElementById('sewaForm');
    const inputDurasi = document.getElementById('durasi');
    const inputMetode = document.getElementById('metode'); // Dropdown Metode
    const displaySubTotal = document.getElementById('subTotal');
    const displayTotal = document.getElementById('totalBayar');
    const modal = document.getElementById('bookingModal');

    const namaMotor = sewaForm.getAttribute('data-motor');
    const hargaPerHari = parseInt(sewaForm.getAttribute('data-harga'));
    const BIAYA_ANTAR = 100000; // Biaya tambahan Rp 100.000

    // --- LOGIKA MENAMPILKAN BIAYA ANTAR DI HALAMAN UTAMA ---
    // Kita buat elemen baris "Biaya Antar" secara manual lewat JS dan selipkan di HTML
    const totalSection = document.querySelector('.total-section');
    const rowSubTotal = totalSection.querySelector('.row'); // Baris subtotal
    
    // Buat elemen baris ongkir (default-nya tersembunyi/display:none)
    const rowOngkir = document.createElement('div');
    rowOngkir.className = 'row';
    rowOngkir.id = 'rowOngkirDisplay';
    rowOngkir.style.display = 'none'; // Sembunyikan dulu
    rowOngkir.style.color = '#e74c3c'; // Warna merah biar beda
    rowOngkir.innerHTML = `<span>Biaya Antar</span><span>+ Rp ${BIAYA_ANTAR.toLocaleString('id-ID')}</span>`;
    
    // Masukkan baris ongkir SETELAH baris subtotal
    rowSubTotal.after(rowOngkir);


    // --- FUNGSI HITUNG REAL-TIME ---
    function hitungTotal() {
        // 1. Ambil Durasi
        let durasi = parseInt(inputDurasi.value);
        if (isNaN(durasi) || durasi < 0) { durasi = 0; }

        // 2. Cek Metode (Apakah Diantar?)
        let isDelivery = inputMetode.value === "Diantar ke Lokasi";
        let ongkir = isDelivery ? BIAYA_ANTAR : 0;

        // 3. Hitung Harga
        let subTotal = durasi * hargaPerHari;
        let grandTotal = subTotal + ongkir;
        
        // 4. Update Tampilan Angka
        if(displaySubTotal) displaySubTotal.innerText = subTotal.toLocaleString('id-ID');
        if(displayTotal) displayTotal.innerText = grandTotal.toLocaleString('id-ID');

        // 5. Tampilkan/Sembunyikan Baris Ongkir di Halaman
        if (isDelivery && durasi > 0) {
            rowOngkir.style.display = 'flex'; // Munculkan baris ongkir
        } else {
            rowOngkir.style.display = 'none'; // Sembunyikan
        }
    }

    // Jalankan hitungTotal saat mengetik durasi ATAU ganti metode
    inputDurasi.addEventListener('input', hitungTotal);
    inputDurasi.addEventListener('change', hitungTotal);
    inputMetode.addEventListener('change', hitungTotal); // Event listener baru untuk dropdown
    
    // Jalankan sekali di awal
    hitungTotal();


    // --- EVENT SAAT KLIK TOMBOL BOOKING ---
    sewaForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validasi Durasi
        let durasiValue = parseInt(inputDurasi.value);
        if (isNaN(durasiValue) || durasiValue <= 0) {
            alert("Mohon isi durasi sewa minimal 1 hari!");
            inputDurasi.focus();
            return;
        }

        // Ambil Data
        let nama = document.getElementById('nama').value;
        let rawDate = document.getElementById('tanggal').value;
        let metodeDipilih = inputMetode.value;
        let isDelivery = metodeDipilih === "Diantar ke Lokasi";
        let ongkir = isDelivery ? BIAYA_ANTAR : 0;
        let subTotal = durasiValue * hargaPerHari;
        let grandTotal = subTotal + ongkir;

        let randomId = Math.floor(Math.random() * 90000) + 10000;

        // Format Tanggal
        let formattedDate = "-";
        if(rawDate) {
            let dateObject = new Date(rawDate);
            formattedDate = dateObject.toLocaleDateString('id-ID', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        }

        // Isi Data ke ID Struk (Header)
        document.getElementById('receiptId').innerText = "#INV-" + randomId;

        // --- GENERATE ISI STRUK (DINAMIS) ---
        // Kita buat HTML isi struk di sini agar rinciannya fleksibel
        let htmlStruk = `
            <div class="receipt-item">
              <span>Tgl Sewa:</span> <span style="font-weight:bold;">${formattedDate}</span>
            </div>
            <div class="receipt-item">
              <span>Customer:</span> <span>${nama.toUpperCase()}</span>
            </div>
            <div class="receipt-item">
              <span>Unit:</span> <span style="font-weight:bold;">${namaMotor}</span>
            </div>
            <div class="receipt-item">
              <span>Durasi:</span> <span>${durasiValue} Hari</span>
            </div>
            <div class="receipt-item" style="border-bottom: 1px dashed #ccc; padding-bottom: 5px; margin-bottom: 5px;">
              <span>Metode:</span> <span>${isDelivery ? 'DELIVERY' : 'PICKUP'}</span>
            </div>
            
            <div class="receipt-item">
              <span>Harga Sewa:</span> <span>Rp ${subTotal.toLocaleString('id-ID')}</span>
            </div>
        `;

        // Tambahkan baris Ongkir di struk HANYA jika metode delivery
        if (isDelivery) {
            htmlStruk += `
            <div class="receipt-item">
              <span>Biaya Antar:</span> <span>Rp ${ongkir.toLocaleString('id-ID')}</span>
            </div>`;
        }

        // Total Akhir
        htmlStruk += `
            <div class="receipt-item receipt-total">
              <span>TOTAL BAYAR</span> <span>Rp ${grandTotal.toLocaleString('id-ID')}</span>
            </div>
        `;

        // Masukkan HTML yang sudah dirakit ke dalam body struk
        document.getElementById('receiptContent').innerHTML = htmlStruk;

        // Tampilkan Modal
        modal.classList.add('show');
    });
});

function tutupModal() {
    document.getElementById('bookingModal').classList.remove('show');
}