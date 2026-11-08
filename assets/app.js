(() => {
  "use strict";
  const config = window.IOT_CONFIG || {};
  const API_BASE = String(config.API_BASE_URL || "").replace(/\/$/, "");
  const REFRESH_MS = Number(config.REFRESH_INTERVAL_MS) || 5000;
  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[c]));
  }

  function displayValue(value) {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  function renderDevices(devices) {
    $("totalCount").textContent = devices.length;
    $("onlineCount").textContent = devices.filter(d => d.online).length;
    $("offlineCount").textContent = devices.filter(d => !d.online).length;

    if (!devices.length) {
      $("deviceGrid").innerHTML = '<div class="empty-state">No devices found. Check that your ESP32 is sending telemetry to the server.</div>';
      return;
    }

    $("deviceGrid").innerHTML = devices.map(device => {
      const telemetry = device.telemetry || {};
      const metrics = Object.entries(telemetry).slice(0, 8).map(([key, value]) =>
        `<div class="metric"><span>${escapeHtml(key)}</span><strong>${escapeHtml(displayValue(value))}</strong></div>`
      ).join("");
      const lastSeen = device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Not reported";
      return `
        <article class="device-card">
          <div class="device-title">
            <h3>${escapeHtml(device.name || device.id)}</h3>
            <span class="device-pill ${device.online ? "online" : "offline"}">${device.online ? "Online" : "Offline"}</span>
          </div>
          <div class="device-meta">ID: ${escapeHtml(device.id)} · Last seen: ${escapeHtml(lastSeen)}</div>
          <div class="telemetry">${metrics || '<div class="metric"><span>Telemetry</span><strong>No data</strong></div>'}</div>
          <div class="device-meta">${Number(device.pendingCommands || 0)} pending command(s)</div>
        </article>`;
    }).join("");
  }

  async function api(path, options = {}) {
    if (!API_BASE || API_BASE.includes("YOUR-SERVER-DOMAIN")) {
      throw new Error("Set your backend URL in config.js first.");
    }
    const response = await fetch(API_BASE + path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Server returned HTTP ${response.status}`);
    return result;
  }

  async function refresh() {
    try {
      const devices = await api("/api/devices");
      renderDevices(Array.isArray(devices) ? devices : []);
      $("serverStatus").textContent = "Server connected";
      $("serverStatus").className = "status-pill good";
      $("lastUpdated").textContent = "Updated " + new Date().toLocaleTimeString();
    } catch (error) {
      $("serverStatus").textContent = "Connection error";
      $("serverStatus").className = "status-pill bad";
      $("deviceGrid").innerHTML = `<div class="empty-state">${escapeHtml(error.message)}<br>Check the API URL, server status and CORS settings.</div>`;
    }
  }

  $("refreshBtn").addEventListener("click", refresh);

  $("commandForm").addEventListener("submit", async event => {
    event.preventDefault();
    const id = $("deviceId").value.trim();
    const command = $("command").value.trim();
    const message = $("formMessage");
    message.textContent = "Sending command...";
    try {
      await api(`/api/devices/${encodeURIComponent(id)}/commands`, {
        method: "POST",
        body: JSON.stringify({ command })
      });
      message.textContent = `Command "${command}" queued for ${id}.`;
      $("command").value = "";
      refresh();
    } catch (error) {
      message.textContent = error.message;
    }
  });

  refresh();
  window.setInterval(refresh, REFRESH_MS);
})();
