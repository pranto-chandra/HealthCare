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

export default { getErrorMessage };
