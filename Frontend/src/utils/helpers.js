export function getErrorMessage(error) {
  if (!error) return "Unknown error";

  // Axios-style error with response payload
  if (error.response) {
    const resp = error.response;
    // Common API shapes: { message }, { error }, { data: { message } }
    if (resp.data) {
      const d = resp.data;
      if (typeof d === "string") return d;
      if (d.message) return d.message;
      if (d.error) return d.error;
      if (d.data && d.data.message) return d.data.message;
    }
    if (resp.statusText) return resp.statusText;
  }

  // Standard Error
  if (error.message) return error.message;

  // Fallback to string conversion
  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
}

// Safe parser for qualifications - handles both JSON arrays and comma-separated strings
export function parseQualifications(value) {
  if (!value) return [];

  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Not valid JSON, treat as comma-separated string
    if (typeof value === "string") {
      return value
        .split(",")
        .map((q) => q.trim())
        .filter((q) => q.length > 0);
    }
  }

  return [];
}

// Safe parser for available days - handles both JSON arrays and comma-separated strings
export function parseAvailableDays(value) {
  if (!value) return [];

  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    // Not valid JSON, treat as comma-separated string
    if (typeof value === "string") {
      return value
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
    }
  }

  return [];
}

export default { getErrorMessage, parseQualifications, parseAvailableDays };
