'use client';
import styleClasses from './rz-button.module.css';

export default function RzButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }): React.ReactNode {
	return (
		<button type="submit" disabled={isSubmitting} className={styleClasses['rz-button']}>
			{label}
		</button>
	);
}
