const userLocale = 'en-US'; //navigator.language; // 'en-US', 'nb-NO', etc.
export const monthOptions = Array.from({ length: 12 }, (_, i) => {
	const date = new Date(2000, i, 1);
	return {
		label: new Intl.DateTimeFormat(userLocale, { month: 'long' }).format(date),
		value: `${i + 1}`,
	};
});
