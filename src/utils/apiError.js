export function getApiErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;

  if (data) {
    if (typeof data === "string") return data;

    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;

    if (Array.isArray(data.errors)) {
      return data.errors.join(", ");
    }

    if (typeof data.errors === "string") {
      return data.errors;
    }
  }

  return error?.message || fallback;
}
