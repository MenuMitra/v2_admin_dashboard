import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileLines,
  faCircleCheck,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import yaml from "js-yaml";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { API_CONFIG } from "../../config/appConfig";
import Breadcrumb from "../Breadcrumb";

const allowedBinaryExtensions = ["apk", "exe"];
const allowedConfigExtensions = ["yml"];

const initialState = {
  binaryFile: null,
  configFile: null,
};

const ReleaseUpdate = () => {
  const [formState, setFormState] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null); // null = idle/unknown, 0-100 when uploading
  const [yamlPreview, setYamlPreview] = useState({ data: null, error: null });
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL } = API_CONFIG;

  const disableSubmit = useMemo(() => {
    if (submitting) return true;
    return !(formState.binaryFile && formState.configFile);
  }, [formState, submitting]);

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Release Update" },
  ];

  const handleBinaryFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setFormState((prev) => ({ ...prev, binaryFile: file }));
  };

  const handleConfigFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setFormState((prev) => ({ ...prev, configFile: file }));

    if (!file) {
      setYamlPreview({ data: null, error: null });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = yaml.load(reader.result || "");
        setYamlPreview({
          data: parsed,
          error: null,
        });
      } catch {
        setYamlPreview({
          data: null,
          error: "Unable to parse YAML config file.",
        });
      }
    };
    reader.onerror = () => {
      setYamlPreview({
        data: null,
        error: "Failed to read config file.",
      });
    };
    reader.readAsText(file);
  };

  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };

  const validateFiles = () => {
    if (!formState.binaryFile || !formState.configFile) {
      return { valid: false, message: "Please select both build and config files." };
    }

    const binaryExt = getFileExtension(formState.binaryFile.name);
    const configExt = getFileExtension(formState.configFile.name);

    if (!allowedBinaryExtensions.includes(binaryExt)) {
      return {
        valid: false,
        message: "Build file must be a .apk or .exe file.",
      };
    }

    if (!allowedConfigExtensions.includes(configExt)) {
      return {
        valid: false,
        message: "Config file must be a .yml file.",
      };
    }

    return {
      valid: true,
      fileType: binaryExt === "exe" ? "desktop" : "mobile",
    };
  };

  const resetForm = () => {
    setFormState(initialState);
    setSubmitting(false);
    setUploadProgress(null);
    setYamlPreview({ data: null, error: null });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disableSubmit) return;

    setSubmitting(true);
    setStatus(null);
    setUploadProgress(0);

    const validation = validateFiles();
    if (!validation.valid) {
      setStatus({
        type: "error",
        message: validation.message,
      });
      setSubmitting(false);
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      if (!adminData?.user_id) {
        throw new Error("User ID not available. Please login again.");
      }

      const formData = new FormData();
      formData.append("file", formState.binaryFile);
      formData.append("config_file", formState.configFile);
      formData.append("file_type", validation.fileType);
      formData.append("user_id", adminData?.user_id || "");
      formData.append("app_source", "admin_panel");

      const response = await axios.post(
        `${BASE_URL}/admin/upload_app_to_server`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) {
              // Indeterminate, show animated bar
              setUploadProgress(null);
              return;
            }
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      const message =
        response?.data?.message ||
        response?.data?.detail ||
        `Release package (${formState.binaryFile.name}) uploaded with ${formState.configFile.name}.`;

      setStatus({
        type: "success",
        message,
      });
      resetForm();
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Upload failed. Please retry.";

      setStatus({
        type: "error",
        message: errorMessage,
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className="px-4 py-0 lg:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header with back button */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              </div>

              <div className="flex-1 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      Release Update
                    </h1>
                    <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-600">
                      Development Builds
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Upload the latest build package for deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form className="flex flex-col gap-6 px-6 py-6" onSubmit={handleSubmit}>
          {status && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-success-100 bg-success-50 text-success-700"
                  : "border-error-100 bg-error-50 text-error-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={status.type === "success" ? faCircleCheck : faFileLines}
                  className="h-4 w-4"
                />
                <span>{status.message}</span>
              </div>
            </div>
          )}

          {(submitting || uploadProgress !== null) && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {uploadProgress !== null
                    ? "Uploading release package..."
                    : "Preparing upload..."}
                </span>
                {uploadProgress !== null && (
                  <span className="font-medium text-gray-700">
                    {uploadProgress}%
                  </span>
                )}
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full bg-success-500 transition-all duration-300 ${
                    uploadProgress === null ? "w-1/3 animate-pulse" : ""
                  }`}
                  style={
                    uploadProgress !== null
                      ? { width: `${Math.min(uploadProgress, 100)}%` }
                      : undefined
                  }
                />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/70 bg-white/70 p-4 text-center shadow-sm">
                <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-brand-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Build Artifact</p>
                  <p className="text-xs text-gray-500">
                    Upload the main .apk (mobile) or .exe (desktop) binary.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-100">
                  Choose build file
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleBinaryFileChange}
                    accept=".apk,.exe"
                  />
                </label>
                {formState.binaryFile && (
                  <div className="rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700 shadow-inner">
                    {formState.binaryFile.name}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-white/70 bg-white/70 p-4 shadow-sm">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-success-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Deployment Config</p>
                    <p className="text-xs text-gray-500">Upload the required .yml manifest.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center rounded-full bg-success-50 px-4 py-2 text-sm font-semibold text-success-600 hover:bg-success-100">
                    Choose config file
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleConfigFileChange}
                      accept=".yml"
                    />
                  </label>
                  {formState.configFile && (
                    <div className="rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700 shadow-inner">
                      {formState.configFile.name}
                    </div>
                  )}
                </div>

                {(yamlPreview.data || yamlPreview.error) && (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">Config preview</span>
                      {yamlPreview.error ? (
                        <span className="font-medium text-error-600">Invalid YAML</span>
                      ) : (
                        <span className="font-medium text-success-600">Parsed</span>
                      )}
                    </div>
                    {yamlPreview.error ? (
                      <p className="text-xs text-error-600">{yamlPreview.error}</p>
                    ) : (
                      <pre className="max-h-40 overflow-auto rounded bg-white p-2 text-[11px] leading-snug text-gray-800">
                        {JSON.stringify(yamlPreview.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              Upload must include either (.exe + .yml) for desktop or (.apk + .yml) for mobile builds.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
            <span>Submitting will notify the deployment channel.</span>
             <div className="flex gap-3">
               <button
                 type="submit"
                 className="rounded-3xl border border-success-500 bg-success-100 px-6 py-2 text-sm font-semibold text-success-700 transition hover:bg-success-200 disabled:cursor-not-allowed disabled:border-success-200 disabled:bg-success-50 disabled:text-success-400"
                 disabled={disableSubmit}
               >
                 {submitting ? "Uploading..." : "Upload Release"}
               </button>
             </div>
          </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ReleaseUpdate;

