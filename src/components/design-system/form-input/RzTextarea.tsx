export function RzTextarea({
	name,
	value,
	onBlur,
	onChange,
}: {
	name: string;
	value: string;
	onBlur: React.FocusEventHandler<HTMLTextAreaElement>;
	onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}): React.ReactNode {
	return <textarea id={name} name={name} value={value} onBlur={onBlur} onChange={onChange} />;
}
