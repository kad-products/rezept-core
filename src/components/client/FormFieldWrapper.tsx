export default function FormFieldWrapper({
	error,
	children,
}: {
	error?: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="form-field">
			<div className="form-inputs">{children}</div>

			{error && <div className="form-field-error">{error}</div>}
		</div>
	);
}
