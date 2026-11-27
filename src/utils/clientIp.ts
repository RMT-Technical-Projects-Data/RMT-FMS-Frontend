const DEVICE_IP_KEY = "edms_device_ip";

/** Best-effort local/LAN IP via WebRTC (for audit trail). */
export const detectDeviceIp = (): Promise<string | null> =>
  new Promise((resolve) => {
    try {
      const saved = localStorage.getItem(DEVICE_IP_KEY);
      if (saved && /^\d{1,3}(\.\d{1,3}){3}$/.test(saved)) {
        resolve(saved);
      }

      const RTCPeerConnection =
        window.RTCPeerConnection ||
        (window as unknown as { webkitRTCPeerConnection?: typeof window.RTCPeerConnection })
          .webkitRTCPeerConnection;
      if (!RTCPeerConnection) {
        resolve(saved || null);
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: [] });
      let settled = false;
      const finish = (ip: string | null) => {
        if (settled) return;
        settled = true;
        try {
          pc.close();
        } catch {
          /* ignore */
        }
        if (ip) {
          try {
            localStorage.setItem(DEVICE_IP_KEY, ip);
          } catch {
            /* ignore */
          }
        }
        resolve(ip || saved || null);
      };

      const timer = window.setTimeout(() => finish(null), 2500);

      pc.createDataChannel("");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finish(null));

      pc.onicecandidate = (event) => {
        if (!event?.candidate) return;
        const cand = event.candidate.candidate || "";
        const match = cand.match(
          /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/i
        );
        if (!match) return;
        const ip = match[1];
        if (
          ip.startsWith("127.") ||
          ip === "::1" ||
          ip.includes(":") // skip IPv6 for display simplicity
        ) {
          return;
        }
        window.clearTimeout(timer);
        finish(ip);
      };
    } catch {
      resolve(null);
    }
  });

export const getCachedDeviceIp = (): string | null => {
  try {
    return localStorage.getItem(DEVICE_IP_KEY);
  } catch {
    return null;
  }
};
