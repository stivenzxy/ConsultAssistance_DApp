let provider, signer, contrato;
let historial = {};

// ─── WALLET ──────────────────────────────────────────
async function conectarWallet() {
    if (!window.ethereum) { alert("Instala MetaMask primero."); return; }
    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer   = await provider.getSigner();
        contrato = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        const addr = await signer.getAddress();
        document.getElementById("walletAddr").textContent = addr;
        const btn = document.getElementById("btnConnect");
        btn.textContent = "Conectado";
        btn.disabled = true;
    } catch (e) {
        alert("Error al conectar: " + e.message);
    }
}


async function abrirAsistencia() {
    const out     = document.getElementById("outAbrir");
    const id      = document.getElementById("inId").value.trim();
    const tema    = document.getElementById("inTema").value.trim();
    const secreto = document.getElementById("inSecretoAbrir").value.trim();

    if (!id || !tema || !secreto) return setOut(out, "err", "Completa todos los campos.");
    if (!/^\d+$/.test(id))         return setOut(out, "err", "El ID de sesión debe ser un número entero.");
    if (!contrato) return setOut(out, "err", "Conecta tu wallet primero.");

    try {
        setOut(out, "info", "Enviando transacción...");
        const tx = await contrato.abrirAsistencia(parseInt(id, 10), tema, secreto);
        setOut(out, "info", `Tx enviada: ${tx.hash}\nEsperando confirmación...`);
        await tx.wait();
        setOut(out, "ok", `✓ Sesión #${id} abierta\nTema: "${tema}"\nTx: ${tx.hash}`);
    } catch (e) {
        setOut(out, "err", "Error: " + (e.reason || e.message));
    }
}


async function marcarAsistencia() {
    const out     = document.getElementById("outMarcar");
    const id      = document.getElementById("inIdMarcar").value.trim();
    const secreto = document.getElementById("inSecretoMarcar").value.trim();

    if (!id || !secreto) return setOut(out, "err", "Completa todos los campos.");
    if (!/^\d+$/.test(id)) return setOut(out, "err", "El ID de sesión debe ser un número entero.");
    if (!contrato) return setOut(out, "err", "Conecta tu wallet primero.");

    try {
        setOut(out, "info", "Enviando transacción...");
        const tx = await contrato.marcarAsistencia(parseInt(id, 10), secreto);
        setOut(out, "info", `Tx enviada: ${tx.hash}\nEsperando confirmación...`);
        await tx.wait();
        const addr = await signer.getAddress();
        setOut(out, "ok", `✓ Asistencia registrada\nSesión: #${id}\nCuenta: ${addr}\nTx: ${tx.hash}`);
    } catch (e) {
        setOut(out, "err", "Error: " + (e.reason || e.message));
    }
}

// ─── CERRAR ASISTENCIA ───────────────────────────────
async function cerrarAsistencia() {
    const out = document.getElementById("outCerrar");
    const id  = document.getElementById("inIdCerrar").value.trim();
    if (!id)           return setOut(out, "err", "Ingresa el ID de sesión.");
    if (!/^\d+$/.test(id)) return setOut(out, "err", "El ID de sesión debe ser un número entero.");
    if (!contrato) return setOut(out, "err", "Conecta tu wallet primero.");
    try {
        setOut(out, "info", "Enviando transacción...");
        const tx = await contrato.cerrarAsistencia(parseInt(id, 10));
        await tx.wait();
        setOut(out, "ok", `✓ Sesión #${id} cerrada\nTx: ${tx.hash}`);
    } catch (e) {
        setOut(out, "err", "Error: " + (e.reason || e.message));
    }
}

// ─── CONSULTAR SESIÓN ACTUAL ─────────────────────────
async function consultarSesion() {
    const infoDiv  = document.getElementById("sesionInfo");
    const attDiv   = document.getElementById("sesionAsistentes");
    const idInput  = document.getElementById("inIdConsultar").value.trim();
    if (!idInput)              { infoDiv.innerHTML = msgBox("err", "Ingresa el ID de sesión."); return; }
    if (!/^\d+$/.test(idInput)){ infoDiv.innerHTML = msgBox("err", "El ID de sesión debe ser un número entero."); return; }
    if (!contrato)             { infoDiv.innerHTML = msgBox("err", "Conecta tu wallet primero."); return; }

    try {
        const [id, tema, activa, fecha] = await contrato.consultarSesion(parseInt(idInput, 10));
        const asistentes = await contrato.verTotalAsistentes(parseInt(idInput, 10));

        const estadoClass = activa ? "ok-val" : "err-val";
        const estadoText  = activa ? "● ACTIVA" : "○ CERRADA";

        infoDiv.innerHTML = `
            <div class="grid2" style="margin-top:12px;">
                <div class="stat">
                    <div class="lbl">ID Sesión</div>
                    <div class="val">#${id}</div>
                </div>
                <div class="stat">
                    <div class="lbl">Estado</div>
                    <div class="val ${estadoClass}">${estadoText}</div>
                </div>
                <div class="stat full">
                    <div class="lbl">Tema</div>
                    <div class="val">${tema}</div>
                </div>
                <div class="stat full">
                    <div class="lbl">Fecha apertura</div>
                    <div class="val">${fmtFecha(fecha)}</div>
                </div>
            </div>`;

        if (asistentes.length > 0) {
            attDiv.innerHTML = `
                <div style="margin-top:14px; font-size:0.72rem; color:var(--text-dim); margin-bottom:6px;">
                    Lista — sesión #${id}
                </div>
                ${asistentes.map((a, i) => `
                    <div class="att-row">
                        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
                        <span style="color:var(--accent)">${a}</span>
                    </div>`).join('')}`;
        } else {
            attDiv.innerHTML = `<div style="margin-top:8px;color:var(--text-dim);font-size:0.78rem;">Sin asistentes aún.</div>`;
        }
    } catch (e) {
        infoDiv.innerHTML = msgBox("err", "Error: " + e.message);
    }
}

// ─── HISTORIAL ON-CHAIN ──────────────────────────────
async function cargarHistorial() {
    const tabsDiv    = document.getElementById("histTabs");
    const contentDiv = document.getElementById("histContent");

    tabsDiv.innerHTML    = '';
    contentDiv.innerHTML = msgBox("info", 'Consultando eventos en Sepolia<span class="dots"></span>');

    if (!provider) { contentDiv.innerHTML = msgBox("err", "Conecta tu wallet primero."); return; }

    try {
        const ro = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        const [evAbiertas, evMarcadas, evCerradas] = await Promise.all([
            ro.queryFilter(ro.filters.AsistenciaAbierta()),
            ro.queryFilter(ro.filters.AsistenciaMarcada()),
            ro.queryFilter(ro.filters.AsistenciaCerrada())
        ]);

        historial = {};

        for (const ev of evAbiertas) {
            const id = ev.args[0].toString();
            historial[id] = {
                id,
                tema:         ev.args[1],
                fechaAbierta: fmtFecha(ev.args[2]),
                fechaCerrada: null,
                asistentes:   []
            };
        }

        for (const ev of evMarcadas) {
            const id = ev.args[1].toString();
            if (historial[id]) {
                historial[id].asistentes.push({
                    address: ev.args[0],
                    fecha:   fmtFecha(ev.args[2])
                });
            }
        }

        for (const ev of evCerradas) {
            const id = ev.args[0].toString();
            if (historial[id]) {
                historial[id].fechaCerrada = fmtFecha(ev.args[1]);
            }
        }

        const sesiones = Object.keys(historial).sort((a, b) => Number(a) - Number(b));

        if (sesiones.length === 0) {
            contentDiv.innerHTML = `<div style="color:var(--text-dim);font-size:0.78rem;">No hay sesiones registradas en este contrato aún.</div>`;
            return;
        }

        sesiones.forEach((id, i) => {
            const t = document.createElement("button");
            t.className = `tab${i === 0 ? " active" : ""}`;
            t.textContent = `Sesión ${id}`;
            t.onclick = () => {
                document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
                t.classList.add("active");
                renderSesion(id);
            };
            tabsDiv.appendChild(t);
        });

        renderSesion(sesiones[0]);
    } catch (e) {
        contentDiv.innerHTML = msgBox("err", "Error: " + e.message);
    }
}
