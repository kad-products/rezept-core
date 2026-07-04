export function RzCheckboxGroup({
	options,
	value,
	onChange,
}: {
	options: Array<{ value: string; label: string }>;
	value: string[];
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}): React.ReactNode {
	return (
		<>
			{options.map(option => (
				<label key={option.value}>
					<input type="checkbox" checked={value.includes(option.value)} onChange={onChange} value={option.value} />
					{option.label}
				</label>
			))}
		</>
	);
}
