'use client';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Dialog } from 'radix-ui';
import styleClasses from './rz-dialog.module.css';

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
				<Dialog.Overlay className={styleClasses.rzDialogOverlay} />
				<Dialog.Content className={styleClasses.rzDialogContent}>
					<Dialog.Title className={styleClasses.rzDialogTitle}>{title}</Dialog.Title>
					{description && <Dialog.Description className={styleClasses.rzDialogDescription}>{description}</Dialog.Description>}
					{children}
					<Dialog.Close asChild>
						<button type="button" className={styleClasses.rzDialogClose} aria-label="Close">
							<Cross2Icon />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
