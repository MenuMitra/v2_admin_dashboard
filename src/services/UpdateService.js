import axios from "axios";
import { API_CONFIG } from "../config/appConfig";

const { BASE_URL } = API_CONFIG;

export class UpdateService {
  static get currentVersion() {
    return "2.1.1";
  }

  static async checkForUpdates() {
    try {
      const response = await axios.post(
        `${BASE_URL}/common/check_version`,
        {
          app_type: "pos",
        }
      );

      

      if (response.data.st === 1) {
        const currentVersion = this.currentVersion;
        const serverVersion = response.data.version;

        // Check if versions are different
        const hasUpdate = currentVersion !== serverVersion;

        return {
          hasUpdate,
          currentVersion,
          serverVersion,
        };
      }

      return {
        hasUpdate: false,
        error: "Invalid server response",
      };
    } catch (error) {
      
      return {
        hasUpdate: false,
        error: error.message,
        currentVersion: this.currentVersion,
        serverVersion: "Unknown",
      };
    }
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
