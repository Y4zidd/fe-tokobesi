/*
 * Inventory UI Helpers (DEMO)
 * Helper bersama untuk halaman-halaman inventaris:
 * format rupiah, format tanggal, notifikasi toast, dialog konfirmasi,
 * dan util kecil lainnya.
 */
(function () {
    'use strict';

    const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    function pad2(n) { return String(n).padStart(2, '0'); }

    // ---------------- format & parse ----------------

    function fmtRupiah(n) {
        n = Math.round(+n || 0);
        return 'Rp ' + n.toLocaleString('id-ID');
    }

    function parseRupiah(str) {
        const raw = String(str || '').replace(/[^\d]/g, '');
        return raw ? parseInt(raw, 10) : 0;
    }

    // 'YYYY-MM-DD' -> 'DD/MM/YYYY'
    function fmtTanggal(ymd) {
        if (!ymd) return '-';
        const parts = String(ymd).slice(0, 10).split('-');
        if (parts.length !== 3) return ymd;
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    // ISO datetime -> 'DD/MM/YYYY HH:MM'
    function fmtWaktu(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        if (isNaN(d)) return fmtTanggal(iso);
        return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    }

    function todayYMD() {
        const d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function firstOfMonthYMD() {
        const d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-01';
    }

    function labelBulan(d) {
        return BULAN[d.getMonth()] + ' ' + String(d.getFullYear()).slice(2);
    }

    // ---------------- input rupiah ----------------

    // pasang format "Rp 1.250.000" otomatis pada input
    function wireRupiahInput(el) {
        if (!el) return;
        function format() {
            const raw = el.value.replace(/[^\d]/g, '');
            if (!raw) { el.value = ''; return; }
            el.value = 'Rp ' + parseInt(raw, 10).toLocaleString('id-ID');
        }
        el.addEventListener('input', format);
        el.addEventListener('focus', function () { if (this.value === '') this.value = 'Rp '; });
        el.addEventListener('blur', function () { if (this.value === 'Rp ') this.value = ''; });
        el._rupiahValue = function () { return parseRupiah(el.value); };
        el._setRupiah = function (n) {
            el.value = n > 0 ? fmtRupiah(n) : '';
        };
    }

    // ---------------- notifikasi & konfirmasi (SweetAlert2) ----------------

    let toastMixin = null;
    function getToast() {
        if (!toastMixin && window.Swal) {
            toastMixin = window.Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
            });
        }
        return toastMixin;
    }

    function toast(msg, type) {
        const t = getToast();
        if (t) t.fire({ icon: type || 'success', title: msg });
        else alert(msg);
    }

    function errorDialog(msg) {
        if (window.Swal) {
            window.Swal.fire({ icon: 'error', title: 'Gagal', text: msg, confirmButtonText: 'Mengerti' });
        } else alert(msg);
    }

    function confirmDialog(opts) {
        if (!window.Swal) return Promise.resolve(confirm(opts.title + '\n\n' + (opts.text || '')));
        return window.Swal.fire({
            title: opts.title || 'Yakin?',
            text: opts.text || '',
            icon: opts.icon || 'warning',
            showCancelButton: true,
            confirmButtonText: opts.confirmText || 'Ya, Lanjutkan',
            cancelButtonText: 'Batal',
            confirmButtonColor: opts.danger === false ? '#435ebe' : '#d33',
        }).then(r => r.isConfirmed);
    }

    function confirmHapus(namaObjek, extraText) {
        return confirmDialog({
            title: 'Hapus ' + namaObjek + '?',
            text: extraText || 'Data yang dihapus tidak bisa dikembalikan (kecuali reset data demo).',
            confirmText: 'Ya, Hapus',
        });
    }

    // ---------------- util DOM kecil ----------------

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function setOptions(selectEl, list, opts) {
        opts = opts || {};
        if (!selectEl) return;
        let html = opts.placeholder ? '<option value="">' + escapeHtml(opts.placeholder) + '</option>' : '';
        list.forEach(item => {
            const value = typeof item === 'object' ? item.value : item;
            const label = typeof item === 'object' ? item.label : item;
            html += '<option value="' + escapeHtml(value) + '"' + (value === opts.selected ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
        });
        selectEl.innerHTML = html;
    }

    function badgeStok(qty, satuan, minStok) {
        if (qty <= 0) return '<span class="badge bg-danger">Habis</span>';
        if (qty <= (minStok || 0)) return '<span class="badge bg-warning text-dark">' + qty + ' ' + escapeHtml(satuan || '') + '</span>';
        return '<span class="badge bg-success">' + qty + ' ' + escapeHtml(satuan || '') + '</span>';
    }

    // Render ulang tabel dinamis dengan tampilan simple-datatables yang sama
    // seperti script template (search, sort, pagination dengan kelas bootstrap).
    function renderDataTable(container, tableHtml, options) {
        if (!container) return null;
        if (container._dt) {
            try { container._dt.destroy(); } catch (e) { /* sudah hancur */ }
            container._dt = null;
        }
        container.innerHTML = tableHtml;
        if (!window.simpleDatatables) return null;
        const dt = new window.simpleDatatables.DataTable(container.querySelector('table'), Object.assign({ searchable: true, fixedHeight: false }, options || {}));
        container._dt = dt;

        function adaptPagination() {
            const paginations = dt.wrapper.querySelectorAll('ul.dataTable-pagination-list');
            for (const pagination of paginations) {
                pagination.classList.add(...['pagination', 'pagination-primary']);
            }
            dt.wrapper.querySelectorAll('ul.dataTable-pagination-list li').forEach(li => li.classList.add('page-item'));
            dt.wrapper.querySelectorAll('ul.dataTable-pagination-list li a').forEach(a => a.classList.add('page-link'));
        }
        function adaptPageDropdown() {
            const selector = dt.wrapper.querySelector('.dataTable-selector');
            if (selector) {
                selector.parentNode.parentNode.insertBefore(selector, selector.parentNode);
                selector.classList.add('form-select');
            }
            adaptPagination();
        }
        dt.on('datatable.init', adaptPageDropdown);
        dt.on('datatable.update', adaptPagination);
        dt.on('datatable.sort', adaptPagination);
        dt.on('datatable.page', adaptPagination);
        return dt;
    }

    window.InvUI = {
        BULAN,
        fmtRupiah,
        parseRupiah,
        fmtTanggal,
        fmtWaktu,
        todayYMD,
        firstOfMonthYMD,
        labelBulan,
        wireRupiahInput,
        toast,
        errorDialog,
        confirmDialog,
        confirmHapus,
        escapeHtml,
        setOptions,
        badgeStok,
        renderDataTable,
    };
})();
