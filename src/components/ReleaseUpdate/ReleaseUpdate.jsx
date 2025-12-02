import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileLines,
  faCircleCheck,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";

const initialState = {
  file: null,
};

const ReleaseUpdate = () => {
  const [formState, setFormState] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const disableSubmit = useMemo(() => {
    if (submitting) return true;
    return !formState.file;
  }, [formState, submitting]);

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Release Update" },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setFormState((prev) => ({ ...prev, file }));
  };

  const resetForm = () => {
    setFormState(initialState);
    setSubmitting(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disableSubmit) return;

    setSubmitting(true);
    setStatus(null);

    try {
      // TODO: wire up to backend when endpoint is available
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setStatus({
        type: "success",
        message: `Release package (${formState.file.name}) queued successfully.`,
      });
      resetForm();
    } catch {
      setStatus({
        type: "error",
        message: "Upload failed. Please retry.",
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

          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <FontAwesomeIcon icon={faUpload} className="h-8 w-8 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Upload release artifact</p>
                <p className="text-xs text-gray-500">APK / IPA / ZIP · max 250MB</p>
              </div>
              <label className="inline-flex cursor-pointer items-center rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-100">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".apk,.ipa,.zip"
                />
              </label>
              {formState.file && (
                <div className="rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm">
                  {formState.file.name}
                </div>
              )}
            </div>
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

