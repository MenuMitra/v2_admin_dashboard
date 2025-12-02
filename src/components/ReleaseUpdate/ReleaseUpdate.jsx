import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faFileLines, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const initialState = {
  version: "",
  notes: "",
  file: null,
};

const ReleaseUpdate = () => {
  const [formState, setFormState] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const disableSubmit = useMemo(() => {
    if (submitting) return true;
    return !(formState.version && formState.notes && formState.file);
  }, [formState, submitting]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

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
    } catch (error) {
      setStatus({
        type: "error",
        message: "Upload failed. Please retry.",
      });
      setSubmitting(false);
    }
  };

  return (
    <section className="px-4 py-6 lg:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            Release Management
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Release Update</h1>
            <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-600">
              Internal
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Upload your latest build package and share a quick summary with the QA / deployment team.
          </p>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Release Version</span>
              <input
                type="text"
                placeholder="e.g. 2.3.0"
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                value={formState.version}
                onChange={handleChange("version")}
                required
              />
              <span className="text-xs text-gray-400">Semantic versioning (major.minor.patch)</span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Release Notes</span>
              <textarea
                rows="4"
                placeholder="Summarize key changes, bug fixes, migrations..."
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                value={formState.notes}
                onChange={handleChange("notes")}
                required
              />
            </label>
          </div>

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
                type="button"
                className="rounded-xl border border-gray-200 px-5 py-2 font-medium text-gray-600 transition hover:bg-gray-50"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 px-6 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-200"
                disabled={disableSubmit}
              >
                {submitting ? "Uploading..." : "Upload Release"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ReleaseUpdate;

