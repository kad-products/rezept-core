export function RzDate({
	name,
	value,
	onBlur,
	onChange,
}: {
	name: string;
	value: string;
	onBlur: React.FocusEventHandler<HTMLInputElement>;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}): React.ReactNode {
	return <input id={name} type="date" name={name} value={value} onBlur={onBlur} onChange={onChange} />;
}
