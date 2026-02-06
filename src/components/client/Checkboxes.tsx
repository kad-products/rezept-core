export default function Checkboxes({
	label,
	name,
	options,
}: {
	label: string;
	name: string;
	options: { value: string; label: string; checked?: boolean }[];
}) {
	return (
		<div className="form-field">
			<div className="form-inputs">
				<fieldset>
					<legend>{label}</legend>
					{options.map(option => (
						<div key={option.value}>
							<input
								type="checkbox"
								id={option.value}
								name={name}
								value={option.value}
								defaultChecked={option.checked || false}
							/>
							<label htmlFor={option.value}>{option.label}</label>
						</div>
					))}
				</fieldset>
			</div>
		</div>
	);
}
