import objectPath from 'object-path';

const debug = true;

export function formDataToObject(formData: FormData): Record<string, unknown> {
	const obj: Record<string, unknown> = {};
	formData.forEach((val, key) => {
		objectPath.set(obj, key, val);
	});

	if (debug) {
		const obj2: Record<string, unknown> = {};
		formData.forEach((value, key) => {
			// Handle multiple values (e.g., checkboxes with the same name)
			if (obj2[key]) {
				if (Array.isArray(obj2[key])) {
					obj2[key].push(value);
				} else {
					obj2[key] = [obj2[key], value];
				}
			} else {
				obj2[key] = value;
			}
		});
		console.log('formDataToObject debug:', JSON.stringify(obj2, null, 4));
	}

	return obj;
}
