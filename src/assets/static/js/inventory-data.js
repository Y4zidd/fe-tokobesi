/*
 * Inventory Data Store (DEMO)
 * ---------------------------------------------------
 * Sumber data dummy bersama untuk semua halaman inventaris.
 * Data disimpan di localStorage sehingga semua perubahan
 * (tambah / edit / hapus) bertahan antar halaman dan antar kunjungan.
 *
 * Stok TIDAK disimpan langsung, melainkan dihitung dari:
 *    stokAwal + (semua barang masuk) - (semua barang keluar)
 * Sehingga stok selalu konsisten dengan riwayat transaksi,
 * termasuk ketika transaksi diedit atau dihapus.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'inventaris-demo-v2';

    // ---------------------------------------------------------------
    // Data seed (dummy tapi realistis - toko bangunan)
    // ---------------------------------------------------------------

    const LOCATIONS = [
        { id: 'lokasi1', nama: 'Lokasi 1' },
        { id: 'lokasi2', nama: 'Lokasi 2' },
        { id: 'lokasi3', nama: 'Lokasi 3' },
    ];

    const CATEGORIES = [
        'Besi & Baja',
        'Semen & Pasir',
        'Cat & Thinner',
        'Pipa & Fitting',
        'Paku & Baut',
        'Alat Pertukangan',
    ];

    // Stok akhir yang diinginkan per barang per lokasi.
    // stokAwal dihitung otomatis dari angka ini dikurangi efek transaksi seed,
    // jadi angka di bawah inilah yang muncul di aplikasi.
    const STOK_AKHIR = {
        'BRG-001': { 'lokasi1': 55, 'lokasi2': 30, 'lokasi3': 25 },
        'BRG-002': { 'lokasi1': 35, 'lokasi2': 18, 'lokasi3': 0 },
        'BRG-003': { 'lokasi1': 42, 'lokasi2': 0,  'lokasi3': 12 },
        'BRG-004': { 'lokasi1': 90, 'lokasi2': 60, 'lokasi3': 35 },
        'BRG-005': { 'lokasi1': 0,  'lokasi2': 58, 'lokasi3': 0 },
        'BRG-006': { 'lokasi1': 26, 'lokasi2': 0,  'lokasi3': 15 },
        'BRG-007': { 'lokasi1': 30, 'lokasi2': 10, 'lokasi3': 0 },
        'BRG-008': { 'lokasi1': 18, 'lokasi2': 0,  'lokasi3': 7 },
        'BRG-009': { 'lokasi1': 45, 'lokasi2': 22, 'lokasi3': 0 },
        'BRG-010': { 'lokasi1': 38, 'lokasi2': 0,  'lokasi3': 30 },
        'BRG-011': { 'lokasi1': 75, 'lokasi2': 40, 'lokasi3': 0 },
        'BRG-012': { 'lokasi1': 90, 'lokasi2': 0,  'lokasi3': 85 },
        'BRG-013': { 'lokasi1': 18, 'lokasi2': 0,  'lokasi3': 0 },
        'BRG-014': { 'lokasi1': 180, 'lokasi2': 120, 'lokasi3': 60 },
        'BRG-015': { 'lokasi1': 0,  'lokasi2': 0,  'lokasi3': 12 },
        'BRG-016': { 'lokasi1': 4,  'lokasi2': 0,  'lokasi3': 0 },
        'BRG-017': { 'lokasi1': 55, 'lokasi2': 28, 'lokasi3': 0 },
        'BRG-018': { 'lokasi1': 20, 'lokasi2': 0,  'lokasi3': 22 },
    };

    const ITEMS_SEED = [
        { kode: 'BRG-001', nama: 'Besi Beton Polos 10mm',        kategori: 'Besi & Baja',      satuan: 'Batang', hargaBeli: 62000,  hargaJual: 75000,  minStok: 20 },
        { kode: 'BRG-002', nama: 'Besi Beton Ulir 12mm',         kategori: 'Besi & Baja',      satuan: 'Batang', hargaBeli: 88000,  hargaJual: 105000, minStok: 15 },
        { kode: 'BRG-003', nama: 'Besi Hollow Galvanis 40x40mm', kategori: 'Besi & Baja',      satuan: 'Batang', hargaBeli: 58000,  hargaJual: 72000,  minStok: 20 },
        { kode: 'BRG-004', nama: 'Semen Tiga Roda 50Kg',         kategori: 'Semen & Pasir',    satuan: 'Sak',    hargaBeli: 58000,  hargaJual: 65000,  minStok: 50 },
        { kode: 'BRG-005', nama: 'Semen Gresik 50Kg',            kategori: 'Semen & Pasir',    satuan: 'Sak',    hargaBeli: 57000,  hargaJual: 64000,  minStok: 40 },
        { kode: 'BRG-006', nama: 'Mortar Instan 40Kg',           kategori: 'Semen & Pasir',    satuan: 'Sak',    hargaBeli: 45000,  hargaJual: 52000,  minStok: 20 },
        { kode: 'BRG-007', nama: 'Cat Besi Avian Hitam 1Kg',     kategori: 'Cat & Thinner',    satuan: 'Kaleng', hargaBeli: 46000,  hargaJual: 55000,  minStok: 15 },
        { kode: 'BRG-008', nama: 'Cat Tembok Avitex 5Kg',        kategori: 'Cat & Thinner',    satuan: 'Pail',   hargaBeli: 145000, hargaJual: 168000, minStok: 10 },
        { kode: 'BRG-009', nama: 'Thinner Impala 1L',            kategori: 'Cat & Thinner',    satuan: 'Botol',  hargaBeli: 16000,  hargaJual: 18000,  minStok: 25 },
        { kode: 'BRG-010', nama: 'Pipa Galvanis 1/2 Inch',       kategori: 'Pipa & Fitting',   satuan: 'Batang', hargaBeli: 30000,  hargaJual: 35000,  minStok: 20 },
        { kode: 'BRG-011', nama: 'Pipa PVC AW 1/2 Inch',         kategori: 'Pipa & Fitting',   satuan: 'Batang', hargaBeli: 11000,  hargaJual: 14000,  minStok: 30 },
        { kode: 'BRG-012', nama: 'Kawat Bendrat 1Kg',            kategori: 'Paku & Baut',      satuan: 'Kg',     hargaBeli: 12000,  hargaJual: 15000,  minStok: 40 },
        { kode: 'BRG-013', nama: 'Paku Beton 2 Inci',            kategori: 'Paku & Baut',      satuan: 'Kg',     hargaBeli: 13000,  hargaJual: 16000,  minStok: 30 },
        { kode: 'BRG-014', nama: 'Baut & Mur Hex Bolt M10',      kategori: 'Paku & Baut',      satuan: 'Pcs',    hargaBeli: 3500,   hargaJual: 5000,   minStok: 100 },
        { kode: 'BRG-015', nama: 'Sekrup Gypsum 4x2 Inci',       kategori: 'Paku & Baut',      satuan: 'Box',    hargaBeli: 38000,  hargaJual: 45000,  minStok: 15 },
        { kode: 'BRG-016', nama: 'Mesin Gerinda Tangan 4 Inci',  kategori: 'Alat Pertukangan', satuan: 'Unit',   hargaBeli: 285000, hargaJual: 320000, minStok: 2 },
        { kode: 'BRG-017', nama: 'Mata Gerinda Potong 4 Inci',   kategori: 'Alat Pertukangan', satuan: 'Pcs',    hargaBeli: 7500,   hargaJual: 9500,   minStok: 30 },
        { kode: 'BRG-018', nama: 'Sarung Tangan Proyek Kulit',   kategori: 'Alat Pertukangan', satuan: 'Pasang', hargaBeli: 9000,   hargaJual: 12000,  minStok: 10 },
    ];

    // Transaksi seed. hariLalu = berapa hari yang lalu (relatif ke hari ini,
    // supaya data selalu terlihat segar kapanpun dibuka).
    // qty masuk sengaja tidak melebihi stok akhir supaya hapus transaksi
    // tidak pernah membuat stok minus.
    const TRANSAKSI_SEED = [
        { type: 'masuk',  kode: 'BRG-004', loc: 'lokasi1', qty: 60,  hariLalu: 0,  jam: '08:15', catatan: 'Restock supplier PT Sinar Bangun', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-001', loc: 'lokasi1', qty: 20,  hariLalu: 0,  jam: '09:00', catatan: 'Proyek Pak Hendra - Perumahan Griya Asri', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-004', loc: 'lokasi3', qty: 15,  hariLalu: 0,  jam: '11:05', catatan: 'Penjualan toko', user: 'Kasir' },
        { type: 'masuk',  kode: 'BRG-009', loc: 'lokasi2', qty: 15,  hariLalu: 0,  jam: '09:30', catatan: 'Restock supplier CV Kimia Jaya', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-007', loc: 'lokasi1', qty: 8,   hariLalu: 0,  jam: '14:40', catatan: 'Order WA Bu Sari', user: 'Kasir' },
        { type: 'masuk',  kode: 'BRG-001', loc: 'lokasi1', qty: 30,  hariLalu: 1,  jam: '10:00', catatan: 'Pembelian supplier KS Teknik', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-003', loc: 'lokasi3', qty: 6,   hariLalu: 1,  jam: '13:10', catatan: 'Kontraktor CV Bangun Jaya', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-007', loc: 'lokasi2', qty: 10,  hariLalu: 1,  jam: '13:20', catatan: 'Restock cat Avian', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-014', loc: 'lokasi1', qty: 100, hariLalu: 2,  jam: '08:40', catatan: 'Pembelian baut & mur', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-014', loc: 'lokasi2', qty: 30,  hariLalu: 2,  jam: '15:20', catatan: 'Bengkel Las Pak Joko', user: 'Kasir' },
        { type: 'masuk',  kode: 'BRG-011', loc: 'lokasi1', qty: 40,  hariLalu: 3,  jam: '09:50', catatan: 'Pipa PVC Rucika', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-011', loc: 'lokasi2', qty: 20,  hariLalu: 3,  jam: '11:30', catatan: 'Proyek Perumahan Green Valley', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-017', loc: 'lokasi1', qty: 25,  hariLalu: 4,  jam: '10:15', catatan: 'Mata gerinda merk Kenshin', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-017', loc: 'lokasi1', qty: 10,  hariLalu: 5,  jam: '09:35', catatan: 'Penjualan toko', user: 'Kasir' },
        { type: 'masuk',  kode: 'BRG-012', loc: 'lokasi1', qty: 50,  hariLalu: 6,  jam: '08:00', catatan: 'Kawat bendrat krakatau', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-004', loc: 'lokasi1', qty: 25,  hariLalu: 7,  jam: '10:25', catatan: 'Proyek Pak Hendra - tahap 2', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-010', loc: 'lokasi3', qty: 20,  hariLalu: 8,  jam: '14:00', catatan: 'Pipa galvanis spindo', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-009', loc: 'lokasi2', qty: 10,  hariLalu: 9,  jam: '13:45', catatan: 'Penjualan toko', user: 'Kasir' },
        { type: 'masuk',  kode: 'BRG-008', loc: 'lokasi1', qty: 8,   hariLalu: 10, jam: '09:10', catatan: 'Cat Avitex paket grosir', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-001', loc: 'lokasi2', qty: 15,  hariLalu: 11, jam: '10:50', catatan: 'Proyek Jembatan Desa Sukamaju', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-005', loc: 'lokasi2', qty: 30,  hariLalu: 12, jam: '08:30', catatan: 'Semen Gresik promo supplier', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-006', loc: 'lokasi1', qty: 5,   hariLalu: 13, jam: '11:15', catatan: 'Order Renovasi Bu Yanti', user: 'Kasir' },
        { type: 'keluar', kode: 'BRG-008', loc: 'lokasi3', qty: 5,   hariLalu: 16, jam: '14:20', catatan: 'Penjualan toko', user: 'Kasir' },
        { type: 'masuk',  kode: 'BRG-016', loc: 'lokasi1', qty: 2,   hariLalu: 15, jam: '10:40', catatan: 'Unit baru merk Kenmaster', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-012', loc: 'lokasi3', qty: 20,  hariLalu: 19, jam: '09:55', catatan: 'Kontraktor CV Bangun Jaya', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-002', loc: 'lokasi1', qty: 20,  hariLalu: 18, jam: '08:20', catatan: 'Besi ulir krakatau steel', user: 'Gudang' },
        { type: 'keluar', kode: 'BRG-002', loc: 'lokasi1', qty: 10,  hariLalu: 21, jam: '13:35', catatan: 'Proyek Pak Hendra - tahap 1', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-006', loc: 'lokasi3', qty: 10,  hariLalu: 22, jam: '09:05', catatan: 'Mortar instan Secoin', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-018', loc: 'lokasi3', qty: 12,  hariLalu: 25, jam: '10:30', catatan: 'APD untuk proyek', user: 'Gudang' },
        { type: 'masuk',  kode: 'BRG-013', loc: 'lokasi1', qty: 10,  hariLalu: 27, jam: '11:45', catatan: 'Paku beton 2 inci', user: 'Gudang' },
    ];

    const HARGA_SEED = [
        { kode: 'BRG-001', lama: 72000, baru: 75000, hariLalu: 0,  jam: '09:15', user: 'Admin' },
        { kode: 'BRG-007', lama: 52000, baru: 55000, hariLalu: 1,  jam: '07:30', user: 'Admin' },
        { kode: 'BRG-004', lama: 63000, baru: 65000, hariLalu: 3,  jam: '10:45', user: 'Admin' },
        { kode: 'BRG-017', lama: 9000,  baru: 9500,  hariLalu: 8,  jam: '11:20', user: 'Admin' },
        { kode: 'BRG-009', lama: 17000, baru: 18000, hariLalu: 14, jam: '08:50', user: 'Admin' },
    ];

    // ---------------------------------------------------------------
    // Utilitas tanggal & id
    // ---------------------------------------------------------------

    function pad2(n) { return String(n).padStart(2, '0'); }

    function toYMD(d) {
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function tanggalDariHariLalu(hariLalu) {
        const d = new Date();
        d.setDate(d.getDate() - hariLalu);
        return toYMD(d);
    }

    function isoDari(hariLalu, jam) {
        return tanggalDariHariLalu(hariLalu) + 'T' + jam + ':00';
    }

    function uid(prefix) {
        return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    // ---------------------------------------------------------------
    // Pembuatan data seed
    // ---------------------------------------------------------------

    function buildSeedData() {
        const items = ITEMS_SEED.map((it, i) => Object.assign({}, it, {
            id: 'itm-' + (i + 1),
            stokAwal: {},
            createdAt: tanggalDariHariLalu(90 - i * 2) + 'T09:00:00',
        }));

        const transactions = [];
        const activity = [];

        TRANSAKSI_SEED.forEach((t, i) => {
            const item = items.find(x => x.kode === t.kode);
            const id = 'trx-' + (i + 1);
            const waktu = isoDari(t.hariLalu, t.jam);
            const hargaTotal = t.type === 'masuk'
                ? t.qty * item.hargaBeli
                : t.qty * item.hargaJual;
            transactions.push({
                id, type: t.type,
                tanggal: tanggalDariHariLalu(t.hariLalu),
                itemId: item.id,
                locationId: t.loc,
                qty: t.qty,
                hargaTotal,
                catatan: t.catatan || '',
                user: t.user || 'Admin',
                createdAt: waktu,
            });
            activity.push({
                id: 'act-t' + (i + 1),
                waktu,
                type: t.type,
                itemId: item.id,
                itemNama: item.nama,
                detail: (t.type === 'masuk' ? 'Masuk ' : 'Keluar ') + t.qty + ' ' + item.satuan,
                locationId: t.loc,
                user: t.user || 'Admin',
            });
        });

        const priceHistory = HARGA_SEED.map((h, i) => {
            const item = items.find(x => x.kode === h.kode);
            const waktu = isoDari(h.hariLalu, h.jam);
            activity.push({
                id: 'act-h' + (i + 1),
                waktu,
                type: 'harga',
                itemId: item.id,
                itemNama: item.nama,
                detail: 'Rp ' + h.lama.toLocaleString('id-ID') + ' → Rp ' + h.baru.toLocaleString('id-ID'),
                locationId: null,
                user: h.user,
            });
            return {
                id: 'ph-' + (i + 1),
                tanggal: tanggalDariHariLalu(h.hariLalu),
                itemId: item.id,
                hargaLama: h.lama,
                hargaBaru: h.baru,
                user: h.user,
                createdAt: waktu,
            };
        });

        // stokAwal = stok akhir yang diinginkan - efek seluruh transaksi seed
        items.forEach(it => {
            const s = Object.assign({}, STOK_AKHIR[it.kode]);
            transactions.forEach(t => {
                if (t.itemId !== it.id) return;
                s[t.locationId] = (s[t.locationId] || 0) + (t.type === 'masuk' ? -t.qty : t.qty);
            });
            it.stokAwal = s;
        });

        // beberapa log aktivitas tambahan
        const extra = [
            { waktu: isoDari(15, '10:40'), type: 'barang', itemId: 'itm-16', itemNama: 'Mesin Gerinda Tangan 4 Inci', detail: 'Menambahkan barang baru', locationId: null, user: 'Admin' },
            { waktu: isoDari(5, '08:55'),  type: 'barang', itemId: 'itm-11', itemNama: 'Pipa PVC AW 1/2 Inch', detail: 'Memperbarui informasi barang', locationId: null, user: 'Admin' },
            { waktu: isoDari(40, '09:00'), type: 'kategori', itemId: null, itemNama: '-', detail: 'Menambahkan kategori baru: Alat Pertukangan', locationId: null, user: 'Admin' },
        ];
        activity.push(...extra.map((a, i) => Object.assign({ id: 'act-x' + (i + 1) }, a)));

        return {
            version: 1,
            locations: LOCATIONS,
            categories: CATEGORIES.slice(),
            items,
            transactions,
            priceHistory,
            activity,
        };
    }

    // ---------------------------------------------------------------
    // Store
    // ---------------------------------------------------------------

    let state = null;
    const subscribers = [];
    let storageOk = true;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.version === 1) {
                    state = parsed;
                    return;
                }
            }
        } catch (e) {
            storageOk = false;
        }
        state = buildSeedData();
        save();
    }

    function save() {
        if (!storageOk) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* kuota penuh dsb - abaikan */ }
        subscribers.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    }

    function findItem(id) { return state.items.find(i => i.id === id) || null; }
    function findLocation(id) { return state.locations.find(l => l.id === id) || null; }
    function locNama(id) { const l = findLocation(id); return l ? l.nama : '-'; }

    // Stok live: stokAwal + masuk - keluar
    function stock(itemId, locationId) {
        const item = findItem(itemId);
        if (!item) return 0;
        const bases = locationId
            ? { [locationId]: (item.stokAwal[locationId] || 0) }
            : item.stokAwal;
        const hasil = {};
        Object.keys(bases).forEach(loc => { hasil[loc] = bases[loc] || 0; });
        state.transactions.forEach(t => {
            if (t.itemId !== itemId) return;
            if (locationId && t.locationId !== locationId) return;
            hasil[t.locationId] = (hasil[t.locationId] || 0) + (t.type === 'masuk' ? t.qty : -t.qty);
        });
        if (locationId) return hasil[locationId] || 0;
        return Object.values(hasil).reduce((a, b) => a + b, 0);
    }

    // Lokasi dianggap "mengelola" barang jika pernah punya stok awal
    // atau pernah ada transaksinya. Dipakai supaya barang yang memang
    // tidak pernah distok di suatu gudang tidak dihitung "habis/menipis".
    function isTracked(itemId, locationId) {
        const item = findItem(itemId);
        if (!item) return false;
        if ((item.stokAwal[locationId] || 0) > 0) return true;
        return state.transactions.some(t => t.itemId === itemId && t.locationId === locationId);
    }

    function logActivity(entry) {
        state.activity.push(Object.assign({
            id: uid('act'),
            waktu: new Date().toISOString(),
            itemId: null,
            itemNama: '-',
            detail: '',
            locationId: null,
            user: 'Admin',
        }, entry));
    }

    const InvStore = {
        getLocations: () => state.locations.slice(),
        locNama,

        getCategories: () => state.categories.slice(),
        addCategory(nama) {
            const bersih = (nama || '').trim();
            if (!bersih) throw new Error('Nama kategori tidak boleh kosong.');
            if (state.categories.some(c => c.toLowerCase() === bersih.toLowerCase())) {
                throw new Error('Kategori "' + bersih + '" sudah ada.');
            }
            state.categories.push(bersih);
            logActivity({
                type: 'kategori',
                itemNama: '-',
                detail: 'Menambahkan kategori baru: ' + bersih,
            });
            save();
            return bersih;
        },

        getItems: () => state.items.slice(),
        getItem: findItem,
        findByKode(kode) { return state.items.find(i => i.kode.toLowerCase() === String(kode).toLowerCase()) || null; },
        stock,
        isTracked,

        nextKode() {
            let max = 0;
            state.items.forEach(i => {
                const m = /^BRG-(\d+)$/.exec(i.kode);
                if (m) max = Math.max(max, parseInt(m[1], 10));
            });
            return 'BRG-' + String(max + 1).padStart(3, '0');
        },

        addItem(payload) {
            if (!payload.nama || !payload.nama.trim()) throw new Error('Nama barang wajib diisi.');
            if (!payload.kategori) throw new Error('Kategori wajib dipilih.');
            if (!(payload.hargaJual > 0)) throw new Error('Harga jual harus lebih dari 0.');
            let kode = (payload.kode || '').trim().toUpperCase();
            if (!kode) kode = this.nextKode();
            if (this.findByKode(kode)) throw new Error('Kode barang "' + kode + '" sudah dipakai barang lain.');

            const stokAwal = {};
            state.locations.forEach(l => {
                const v = payload.stokAwal && payload.stokAwal[l.id];
                stokAwal[l.id] = Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0;
            });

            const hargaJual = Math.round(+payload.hargaJual);
            const item = {
                id: uid('itm'),
                kode,
                nama: payload.nama.trim(),
                kategori: payload.kategori,
                satuan: (payload.satuan || 'Pcs').trim() || 'Pcs',
                hargaJual,
                hargaBeli: +payload.hargaBeli > 0 ? Math.round(+payload.hargaBeli) : hargaJual,
                minStok: +payload.minStok > 0 ? Math.floor(+payload.minStok) : 10,
                stokAwal,
                createdAt: new Date().toISOString(),
            };
            state.items.push(item);
            const totalAwal = Object.values(stokAwal).reduce((a, b) => a + b, 0);
            logActivity({
                type: 'barang',
                itemId: item.id,
                itemNama: item.nama,
                detail: 'Menambahkan barang baru' + (totalAwal > 0 ? ' (stok awal ' + totalAwal + ' ' + item.satuan + ')' : ''),
            });
            save();
            return item;
        },

        updateItem(id, patch) {
            const item = findItem(id);
            if (!item) throw new Error('Barang tidak ditemukan.');
            const perubahan = [];

            if (patch.kode !== undefined) {
                const kode = String(patch.kode).trim().toUpperCase();
                if (!kode) throw new Error('Kode barang tidak boleh kosong.');
                const lain = this.findByKode(kode);
                if (lain && lain.id !== id) throw new Error('Kode barang "' + kode + '" sudah dipakai barang lain.');
                if (kode !== item.kode) { perubahan.push('kode ' + item.kode + ' → ' + kode); item.kode = kode; }
            }
            if (patch.nama !== undefined) {
                const nama = String(patch.nama).trim();
                if (!nama) throw new Error('Nama barang wajib diisi.');
                if (nama !== item.nama) { perubahan.push('nama'); item.nama = nama; }
            }
            if (patch.kategori !== undefined && patch.kategori && patch.kategori !== item.kategori) {
                perubahan.push('kategori ' + item.kategori + ' → ' + patch.kategori);
                item.kategori = patch.kategori;
            }
            if (patch.hargaJual !== undefined && +patch.hargaJual > 0 && +patch.hargaJual !== item.hargaJual) {
                perubahan.push('harga jual Rp ' + item.hargaJual.toLocaleString('id-ID') + ' → Rp ' + (+patch.hargaJual).toLocaleString('id-ID'));
                item.hargaJual = Math.round(+patch.hargaJual);
            }
            if (patch.hargaBeli !== undefined && +patch.hargaBeli >= 0 && +patch.hargaBeli !== item.hargaBeli) {
                perubahan.push('harga beli');
                item.hargaBeli = Math.round(+patch.hargaBeli);
            }
            if (patch.satuan !== undefined && patch.satuan.trim() && patch.satuan.trim() !== item.satuan) {
                perubahan.push('satuan ' + item.satuan + ' → ' + patch.satuan.trim());
                item.satuan = patch.satuan.trim();
            }
            if (patch.minStok !== undefined && +patch.minStok >= 0 && Math.floor(+patch.minStok) !== item.minStok) {
                perubahan.push('stok minimum ' + item.minStok + ' → ' + Math.floor(+patch.minStok));
                item.minStok = Math.floor(+patch.minStok);
            }

            if (perubahan.length) {
                logActivity({
                    type: 'barang',
                    itemId: item.id,
                    itemNama: item.nama,
                    detail: 'Memperbarui data barang (' + perubahan.join(', ') + ')',
                });
                save();
            }
            return item;
        },

        deleteItem(id) {
            const item = findItem(id);
            if (!item) throw new Error('Barang tidak ditemukan.');
            const nTrx = state.transactions.filter(t => t.itemId === id).length;
            state.transactions = state.transactions.filter(t => t.itemId !== id);
            state.priceHistory = state.priceHistory.filter(p => p.itemId !== id);
            state.items = state.items.filter(i => i.id !== id);
            logActivity({
                type: 'barang',
                itemId: null,
                itemNama: item.nama,
                detail: 'Menghapus barang' + (nTrx ? ' beserta ' + nTrx + ' transaksinya' : ''),
            });
            save();
            return item;
        },

        getTransaksi: () => state.transactions.slice(),

        addTransaksi(type, payload) {
            const item = findItem(payload.itemId);
            if (!item) throw new Error('Pilih barang terlebih dahulu.');
            const loc = findLocation(payload.locationId);
            if (!loc) throw new Error('Pilih lokasi gudang terlebih dahulu.');
            const qty = Math.floor(+payload.qty);
            if (!qty || qty <= 0) throw new Error('Jumlah harus lebih dari 0.');
            if (!payload.tanggal) throw new Error('Tanggal wajib diisi.');

            if (type === 'keluar') {
                const tersedia = stock(item.id, loc.id);
                if (qty > tersedia) {
                    throw new Error('Stok ' + item.nama + ' di ' + loc.nama + ' hanya tersedia ' + tersedia + ' ' + item.satuan + '.');
                }
            }

            const trx = {
                id: uid('trx'),
                type,
                tanggal: payload.tanggal,
                itemId: item.id,
                locationId: loc.id,
                qty,
                hargaTotal: Math.max(0, Math.round(+payload.hargaTotal || 0)),
                catatan: (payload.catatan || '').trim(),
                user: 'Admin',
                createdAt: new Date().toISOString(),
            };
            state.transactions.push(trx);
            logActivity({
                type,
                itemId: item.id,
                itemNama: item.nama,
                detail: (type === 'masuk' ? 'Masuk ' : 'Keluar ') + qty + ' ' + item.satuan,
                locationId: loc.id,
            });
            save();
            return trx;
        },

        updateTransaksi(id, patch) {
            const trx = state.transactions.find(t => t.id === id);
            if (!trx) throw new Error('Transaksi tidak ditemukan.');
            const item = findItem(trx.itemId);
            if (!item) throw new Error('Barang transaksi sudah tidak ada.');

            const baru = {
                tanggal: patch.tanggal || trx.tanggal,
                locationId: patch.locationId || trx.locationId,
                qty: patch.qty !== undefined ? Math.floor(+patch.qty) : trx.qty,
                hargaTotal: patch.hargaTotal !== undefined ? Math.max(0, Math.round(+patch.hargaTotal || 0)) : trx.hargaTotal,
                catatan: patch.catatan !== undefined ? String(patch.catatan).trim() : trx.catatan,
            };
            if (!baru.qty || baru.qty <= 0) throw new Error('Jumlah harus lebih dari 0.');
            if (!findLocation(baru.locationId)) throw new Error('Lokasi tidak valid.');

            // validasi stok untuk barang keluar:
            // stok di lokasi tujuan dikurangi efek transaksi lama dulu
            if (trx.type === 'keluar') {
                const stokTanpaTrxIni = item.stokAwal[baru.locationId] || 0;
                state.transactions.forEach(t => {
                    if (t.id === id || t.itemId !== item.id || t.locationId !== baru.locationId) return;
                    stokTanpaTrxIni += (t.type === 'masuk' ? t.qty : -t.qty);
                });
                if (baru.qty > stokTanpaTrxIni) {
                    throw new Error('Stok ' + item.nama + ' di ' + locNama(baru.locationId) + ' hanya ' + stokTanpaTrxIni + ' ' + item.satuan + '.');
                }
            }

            trx.tanggal = baru.tanggal;
            trx.locationId = baru.locationId;
            trx.qty = baru.qty;
            trx.hargaTotal = baru.hargaTotal;
            trx.catatan = baru.catatan;

            logActivity({
                type: trx.type,
                itemId: item.id,
                itemNama: item.nama,
                detail: 'Mengubah transaksi menjadi ' + (trx.type === 'masuk' ? 'masuk ' : 'keluar ') + baru.qty + ' ' + item.satuan + ' di ' + locNama(baru.locationId),
                locationId: baru.locationId,
            });
            save();
            return trx;
        },

        deleteTransaksi(id) {
            const trx = state.transactions.find(t => t.id === id);
            if (!trx) throw new Error('Transaksi tidak ditemukan.');
            const item = findItem(trx.itemId);
            // barang keluar dikembalikan ke stok, barang masuk ditarik kembali
            if (trx.type === 'masuk') {
                const sisa = stock(trx.itemId, trx.locationId) - trx.qty;
                if (sisa < 0) {
                    throw new Error('Tidak bisa menghapus: stok ' + (item ? item.nama : '') + ' di ' + locNama(trx.locationId) + ' akan minus.');
                }
            }
            state.transactions = state.transactions.filter(t => t.id !== id);
            logActivity({
                type: trx.type,
                itemId: trx.itemId,
                itemNama: item ? item.nama : '-',
                detail: 'Menghapus transaksi ' + (trx.type === 'masuk' ? 'masuk ' : 'keluar ') + trx.qty + ' ' + (item ? item.satuan : ''),
                locationId: trx.locationId,
            });
            save();
            return trx;
        },

        getPriceHistory: () => state.priceHistory.slice(),

        updateHarga(itemId, hargaBaru, tanggal) {
            const item = findItem(itemId);
            if (!item) throw new Error('Pilih barang terlebih dahulu.');
            const baru = Math.round(+hargaBaru);
            if (!baru || baru <= 0) throw new Error('Harga baru harus lebih dari 0.');
            if (baru === item.hargaJual) throw new Error('Harga baru sama dengan harga sekarang.');
            if (!tanggal) throw new Error('Tanggal wajib diisi.');

            const entry = {
                id: uid('ph'),
                tanggal,
                itemId: item.id,
                hargaLama: item.hargaJual,
                hargaBaru: baru,
                user: 'Admin',
                createdAt: new Date().toISOString(),
            };
            state.priceHistory.push(entry);
            item.hargaJual = baru;
            logActivity({
                type: 'harga',
                itemId: item.id,
                itemNama: item.nama,
                detail: 'Rp ' + entry.hargaLama.toLocaleString('id-ID') + ' → Rp ' + baru.toLocaleString('id-ID'),
            });
            save();
            return entry;
        },

        deletePriceHistory(id) {
            const entry = state.priceHistory.find(p => p.id === id);
            if (!entry) throw new Error('Riwayat harga tidak ditemukan.');
            state.priceHistory = state.priceHistory.filter(p => p.id !== id);
            const item = findItem(entry.itemId);
            logActivity({
                type: 'harga',
                itemId: entry.itemId,
                itemNama: item ? item.nama : '-',
                detail: 'Menghapus catatan perubahan harga (Rp ' + entry.hargaBaru.toLocaleString('id-ID') + ')',
            });
            save();
            return entry;
        },

        getActivity: () => state.activity.slice(),

        resetDemo() {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
            state = buildSeedData();
            save();
        },

        subscribe(fn) {
            subscribers.push(fn);
        },
    };

    // sinkron antar tab browser
    window.addEventListener('storage', (e) => {
        if (e.key !== STORAGE_KEY) return;
        try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.version === 1) {
                state = parsed;
                subscribers.forEach(fn => { try { fn(); } catch (err) { console.error(err); } });
            }
        } catch (err) { /* noop */ }
    });

    load();
    window.InvStore = InvStore;
})();
