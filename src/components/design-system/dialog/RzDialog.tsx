'use client';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Dialog } from 'radix-ui';

export default function RzDialog({
	trigger,
	title,
	description,
	children,
}: {
	trigger: React.ReactNode;
	title: string;
	description?: string;
	children: React.ReactNode;
}): React.ReactNode {
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="rz-dialog-overlay" />
				<Dialog.Content className="rz-dialog-content">
					<Dialog.Title className="rz-dialog-title">{title}</Dialog.Title>
					{description && <Dialog.Description className="rz-dialog-description">{description}</Dialog.Description>}
					{children}
					<Dialog.Close asChild>
						<button type="button" className="rz-dialog-close" aria-label="Close">
							<Cross2Icon />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
