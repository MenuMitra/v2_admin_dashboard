const DEVICE_ID_KEY = "mm_device_id";
const REMEMBER_MOBILE_KEY = "mm_remember_mobile";

export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `${Date.now()}${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getRememberedMobile() {
  return localStorage.getItem(REMEMBER_MOBILE_KEY) || "";
}

export function setRememberedMobile(mobile, remember) {
  if (remember && mobile) {
    localStorage.setItem(REMEMBER_MOBILE_KEY, mobile);
  } else {
    localStorage.removeItem(REMEMBER_MOBILE_KEY);
  }
}

function parseUserAgent(userAgent) {
  let browserName = "Unknown";
  let browserVersion = "";
  let osName = "Unknown";
  let osVersion = "";

  const browserRegexes = [
    [/Edg\/(\d+\.\d+)/, "Edge"],
    [/OPR\/(\d+\.\d+)/, "Opera"],
    [/Chrome\/(\d+\.\d+)/, "Chrome"],
    [/Firefox\/(\d+\.\d+)/, "Firefox"],
    [/Version\/(\d+\.\d+).*Safari/, "Safari"],
    [/Safari\/(\d+\.\d+)/, "Safari"],
  ];
  for (const [regex, name] of browserRegexes) {
    const match = userAgent.match(regex);
    if (match) {
      browserName = name;
      browserVersion = match[1];
      break;
    }
  }

  const osMatchers = [
    [/(Windows NT) (\d+\.\d+)/, (m) => ({ osName: "Windows", osVersion: m[2] })],
    [/(Android) (\d+(?:\.\d+)?)/, (m) => ({ osName: "Android", osVersion: m[2] })],
    [
      /iPhone OS (\d+_\d+)/,
      (m) => ({ osName: "iOS", osVersion: m[1].replace(/_/g, ".") }),
    ],
    [
      /iPad; CPU OS (\d+_\d+)/,
      (m) => ({ osName: "iPadOS", osVersion: m[1].replace(/_/g, ".") }),
    ],
    [
      /(Mac OS X) (\d+[_\.]\d+(?:[_\.]\d+)?)/,
      (m) => ({ osName: "macOS", osVersion: m[2].replace(/_/g, ".") }),
    ],
    [/(Linux)/, () => ({ osName: "Linux", osVersion: "" })],
  ];
  for (const [regex, mapper] of osMatchers) {
    const match = userAgent.match(regex);
    if (match) {
      const mapped = mapper(match);
      osName = mapped.osName;
      osVersion = mapped.osVersion;
      break;
    }
  }

  return { browserName, browserVersion, osName, osVersion };
}

export function getBrowserDetails() {
  try {
    const nav = window.navigator || {};
    const ua = nav.userAgent || "";
    const platform = nav.platform || "";
    const language = nav.language || nav.userLanguage || "";
    const vendor = nav.vendor || "";
    const uaData = nav.userAgentData || null;
    const mobile = !!uaData?.mobile || /Mobi|Android/i.test(ua);

    const { browserName, browserVersion, osName, osVersion } = parseUserAgent(ua);
    const browserMajor = (browserVersion || "").split(".")[0] || "";
    const osVersionMajor = (osVersion || "").split(/[._]/)[0] || "";
    const userAgentName = `${browserName}${browserMajor ? ` ${browserMajor}` : ""}${
      osName && osName !== "Unknown"
        ? ` on ${osName}${osVersionMajor ? ` ${osVersionMajor}` : ""}`
        : ""
    }`;

    let deviceModel = null;
    const androidMatch = ua.match(/Android[^;]*;\s*([^;)]+)/i);
    if (androidMatch?.[1]) {
      deviceModel = androidMatch[1].trim();
    }
    if (!deviceModel) {
      const iosMatch = ua.match(/(iPhone|iPad|iPod)/i);
      if (iosMatch) deviceModel = iosMatch[1];
    }

    deviceModel =
      deviceModel || vendor || platform || userAgentName || "Unknown Device";

    return {
      userAgent: ua,
      platform,
      language,
      vendor,
      isMobile: mobile,
      browser: { name: browserName, version: browserVersion },
      os: { name: osName, version: osVersion },
      userAgentName,
      deviceModel,
    };
  } catch {
    return { userAgentName: "Unknown Device", deviceModel: "Unknown Device" };
  }
}

export function getDeviceModel() {
  const details = getBrowserDetails();
  return details.deviceModel || details.userAgentName || "Unknown Device";
}

export function buildDevicePayload() {
  const details = getBrowserDetails();
  return {
    device_id: getDeviceId(),
    device_model: getDeviceModel(),
    user_agent_name: details.userAgentName,
  };
}
