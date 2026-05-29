// ─── SIDEBAR NAVIGATION ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.page;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${target}`).classList.add('active');
        });
    });
});

// ─── OUTPUT HELPERS ──────────────────────────────────
function setOut(el, type, text) {
    el.className = `out show ${type}`;
    el.textContent = text;
}

function msgBox(type, html) {
    return `<div class="out show ${type}" style="margin-top:10px">${html}</div>`;
}

function fmtFecha(ts) {
    return new Date(Number(ts) * 1000).toLocaleString('es-CO', {
        dateStyle: 'short', timeStyle: 'medium'
    });
}

// ─── THEME TOGGLE ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('light');
        toggle.checked = true;
    }
    toggle.addEventListener('change', () => {
        document.body.classList.toggle('light');
        localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
    });
});

function renderSesion(id) {
    const s = historial[id];
    const contentDiv = document.getElementById("histContent");

    const cerradaBadge = s.fechaCerrada
        ? `<span style="font-size:0.75rem;color:var(--text-dim)">${s.fechaCerrada}</span>`
        : `<span class="ok-val" style="font-size:0.8rem">● Activa</span>`;

    contentDiv.innerHTML = `
        <div class="grid2">
            <div class="stat">
                <div class="lbl">Sesión #</div>
                <div class="val">${s.id}</div>
            </div>
            <div class="stat">
                <div class="lbl">Asistentes</div>
                <div class="val ok-val">${s.asistentes.length}</div>
            </div>
            <div class="stat full">
                <div class="lbl">Tema</div>
                <div class="val">${s.tema}</div>
            </div>
            <div class="stat">
                <div class="lbl">Abierta</div>
                <div class="val" style="font-size:0.76rem">${s.fechaAbierta}</div>
            </div>
            <div class="stat">
                <div class="lbl">Cerrada</div>
                <div class="val">${cerradaBadge}</div>
            </div>
        </div>

        ${s.asistentes.length > 0 ? `
        <div style="margin-top:14px; font-size:0.72rem; color:var(--text-dim); margin-bottom:6px;">
            Registro de asistencia — ${s.asistentes.length} estudiante(s)
        </div>
        <table class="htable">
            <thead>
                <tr><th>#</th><th>Dirección</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
                ${s.asistentes.map((a, i) => `
                    <tr>
                        <td>${String(i + 1).padStart(2, '0')}</td>
                        <td class="addr-cell">${a.address}</td>
                        <td class="date-cell">${a.fecha}</td>
                    </tr>`).join('')}
            </tbody>
        </table>` :
        `<div style="margin-top:8px;color:var(--text-dim);font-size:0.78rem;">Sin asistentes en esta sesión.</div>`}
    `;
}
