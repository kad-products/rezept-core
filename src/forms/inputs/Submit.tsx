'use client';
import { useFormContext } from '../context';

export function Submit({ label }: { label: string }): React.ReactNode {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state: { isSubmitting: boolean }): boolean => state.isSubmitting}>
			{(isSubmitting: boolean): React.ReactNode => (
				<button type="submit" disabled={isSubmitting}>
					{label}
				</button>
			)}
		</form.Subscribe>
	);
}
