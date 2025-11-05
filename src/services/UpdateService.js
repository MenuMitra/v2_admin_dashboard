export class UpdateService {
  static get currentVersion() {
    return "2.1.1";
  }

  static async checkForUpdates() {
    // API call removed - no longer checking for updates
    return {
      hasUpdate: false,
      currentVersion: this.currentVersion,
      serverVersion: "Unknown",
    };
  }

  static isValidVersion(version) {
    if (!version) return false;
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  }

  static compareVersions(current, server) {
    if (!current || !server) return false;
    return current !== server; // Return true if versions are different
  }
}

export default UpdateService;
