document.addEventListener('DOMContentLoaded', () => {
  if (typeof json_menaratelpon_join_6 === 'undefined' || typeof json_Batas_Administrasi_Kecamatan_1 === 'undefined') {
    alert('⚠️ Pastikan data menara & admin sudah terhubung.');
    return;
  }

  const menara = json_menaratelpon_join_6.features || [];
  const admin = json_Batas_Administrasi_Kecamatan_1.features || [];

  // ---------- KPI ----------
  const totalMenara = menara.length;
  const totalKecamatan = new Set(admin.map(f => f.properties?.WADMKC || 'Tidak Diketahui')).size;
  document.getElementById('totalMenara').textContent = totalMenara.toLocaleString('id-ID');
  document.getElementById('totalKecamatan').textContent = totalKecamatan || '-';

  // ---------- PIE: Kategori Jarak ----------
  const klasJarak = d => {
    const x = Number(d);
    if (!Number.isFinite(x)) return 'Tidak Diketahui';
    if (x <= 103.01993) return 'Dekat';
    if (x <= 206.039861) return 'Sedang';
    if (x <= 309.059791) return 'Jauh';
    return 'Tidak Diketahui';
  };

  const byJarak = { Dekat: 0, Sedang: 0, Jauh: 0 };
  menara.forEach(f => byJarak[klasJarak(f.properties.distance)]++);

  const pieChart = new Chart(document.getElementById('pieJarak'), {
    type: 'pie',
    data: {
      labels: Object.keys(byJarak),
      datasets: [{
        data: Object.values(byJarak),
        backgroundColor: ['#ffb3ba', '#ffd6a5', '#bde0fe'],
        borderWidth: 1,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { callbacks: { label: c => `${c.label}: ${c.parsed} Menara` } }
      }
    }
  });

// ---------- BAR + TABLE: Distribusi Kecamatan ----------
    const dataKec = admin.map(f => ({
    kec: f.properties?.WADMKC || 'Tidak Diketahui',
    jumlah: Number(f.properties?.Jumlah_Men) || 0
    })).sort((a, b) => b.jumlah - a.jumlah);

    const barChart = new Chart(document.getElementById('barKecamatan'), {
    type: 'bar',
    data: {
        labels: dataKec.map(d => d.kec),
        datasets: [{
        label: 'Jumlah Menara',
        data: dataKec.map(d => d.jumlah),
        backgroundColor: '#bde0fe',
        borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 0.9,
        scales: {
        x: {
            title: { display: false },
            ticks: { maxRotation: 45, minRotation: 45 }
        },
        y: {
            beginAtZero: true,
            title: { display: true, text: 'Jumlah Menara' }
        }
        },
        plugins: { legend: { display: false } }
    }
    });


  // ----- Tambahkan tabel di bawah grafik -----
  const barSection = document.getElementById('bar-section');
  const tableDiv = document.createElement('div');
  tableDiv.className = 'mt-2';

  let tableHTML = `
    <table class="table table-sm table-bordered text-center align-middle">
      <thead class="table-light">
        <tr>
          <th style="width:5%">No</th>
          <th>Kecamatan</th>
          <th>Jumlah Menara</th>
        </tr>
      </thead>
      <tbody>
        ${dataKec.map((d,i)=>`
          <tr>
            <td>${i+1}</td>
            <td>${d.kec}</td>
            <td>${d.jumlah}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
  tableDiv.innerHTML = tableHTML;
  barSection.querySelector('.card.tablebox').appendChild(tableDiv);

  // ---------- TOGGLE antar chart ----------
  const sections = {
    pie: document.getElementById('pie-section'),
    bar: document.getElementById('bar-section')
  };
  const buttons = document.querySelectorAll('.navbtn');

  const activate = target => {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.target === target));
    Object.entries(sections).forEach(([key, el]) =>
      el.classList.toggle('hidden', key !== target)
    );
    setTimeout(() => {
      if (target === 'pie') pieChart.resize();
      else barChart.resize();
    }, 100);
  };

  buttons.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.target)));
  activate('pie');
});
