import { RzButton } from '@/components/design-system';
import { useFormContext } from '../context';

export function SubmitButton({ label }: { label: string }): React.ReactNode {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state: { isSubmitting: boolean }): boolean => state.isSubmitting}>
			{(isSubmitting: boolean): React.ReactNode => <RzButton isSubmitting={isSubmitting} label={label} />}
		</form.Subscribe>
	);
}
