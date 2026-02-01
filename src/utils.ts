export function formDataToObject(formData: FormData): Record<string, any> {
	const obj: Record<string, any> = {};
	formData.forEach((value, key) => {
		// Handle multiple values (e.g., checkboxes with the same name)
		if (obj[key]) {
			if (Array.isArray(obj[key])) {
				obj[key].push(value);
			} else {
				obj[key] = [obj[key], value];
			}
		} else {
			obj[key] = value;
		}
	});
	return obj;
}
