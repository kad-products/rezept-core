export default function FormFieldWrapper({ errors, children }: { errors?: string[] | undefined; children?: React.ReactNode }) {
	return (
		<div className="form-field">
			<div className="form-inputs">{children}</div>

			{errors && (
				<div className="form-field-error">
					{errors.map(error => (
						<p key={error} className="error">
							{error}
						</p>
					))}
				</div>
			)}
		</div>
	);
}
