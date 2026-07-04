export function RzText({
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
	return <input id={name} type="text" name={name} value={value} onBlur={onBlur} onChange={onChange} />;
}
