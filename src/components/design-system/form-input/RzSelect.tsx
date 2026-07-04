'use client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Select as RadixSelect } from 'radix-ui';

export function RzSelect<T = string>({
	value,
	onChange,
	options,
	...props
}: {
	value: string;
	onChange: (value: string) => void;
	options: Array<{ value: T; label: string }>;
} & React.ComponentPropsWithoutRef<typeof RadixSelect.Root>): React.ReactNode {
	return (
		<RadixSelect.Root {...props} onValueChange={onChange} value={value as unknown as string}>
			<RadixSelect.Trigger className="rz-select-trigger">
				<RadixSelect.Value placeholder="Select an option" />
				<RadixSelect.Icon className="rz-select-icon">
					<ChevronDownIcon />
				</RadixSelect.Icon>
			</RadixSelect.Trigger>
			<RadixSelect.Content className="rz-select-content">
				<RadixSelect.Viewport className="rz-select-viewport">
					{options.map(option => (
						<RadixSelect.Item
							key={option.value as unknown as string}
							value={option.value as unknown as string}
							className="rz-select-item"
						>
							<RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
							<RadixSelect.ItemIndicator className="rz-select-item-indicator" />
						</RadixSelect.Item>
					))}
				</RadixSelect.Viewport>
			</RadixSelect.Content>
		</RadixSelect.Root>
	);
}
