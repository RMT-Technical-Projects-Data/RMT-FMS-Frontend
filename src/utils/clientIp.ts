const DEVICE_IP_KEY = "edms_device_ip";

const isPrivateIpv4 = (ip: string) =>
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ip);

/** Best-effort local/LAN IP via WebRTC (for audit trail). */
export const detectDeviceIp = (): Promise<string | null> =>
  new Promise((resolve) => {
    try {
      const saved = localStorage.getItem(DEVICE_IP_KEY);
      if (saved && /^\d{1,3}(\.\d{1,3}){3}$/.test(saved)) {
        // Still refresh in background, but return cached immediately
        resolve(saved);
      }

      const RTCPeerConnection =
        window.RTCPeerConnection ||
        (
          window as unknown as {
            webkitRTCPeerConnection?: typeof window.RTCPeerConnection;
          }
        ).webkitRTCPeerConnection;
      if (!RTCPeerConnection) {
        if (!saved) resolve(null);
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
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
        // Only resolve if we didn't already resolve with cache
        if (!saved) resolve(ip);
      };

      const timer = window.setTimeout(() => finish(null), 4000);

      pc.createDataChannel("edms-audit");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finish(null));

      pc.onicecandidate = (event) => {
        if (!event?.candidate) return;
        const cand = event.candidate.candidate || "";
        const match = cand.match(
          /([0-9]{1,3}(?:\.[0-9]{1,3}){3})/
        );
        if (!match) return;
        const ip = match[1];
        if (ip.startsWith("127.") || ip === "0.0.0.0") return;
        // Prefer private LAN addresses for device identity
        if (!isPrivateIpv4(ip) && !ip.startsWith("169.254.")) return;
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
