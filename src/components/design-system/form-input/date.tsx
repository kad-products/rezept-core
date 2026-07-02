export function DateInput({
	name,
	value,
	handleBlur,
	handleChange,
}: {
	name: string;
	value: string;
	handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
	handleChange: (value: string) => void;
}): React.ReactNode {
	return (
		<input
			id={name}
			type="date"
			name={name}
			value={value}
			onBlur={handleBlur}
			onChange={(e: React.ChangeEvent<HTMLInputElement>): void => handleChange(e.target.value)}
		/>
	);
}
