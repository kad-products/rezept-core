'use client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Select as RadixSelect } from 'radix-ui';
import styleClasses from './rz-select.module.css';

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
			<RadixSelect.Trigger className={styleClasses.rzSelectTrigger}>
				<RadixSelect.Value placeholder="Select an option" />
				<RadixSelect.Icon className={styleClasses.rzSelectIcon}>
					<ChevronDownIcon />
				</RadixSelect.Icon>
			</RadixSelect.Trigger>
			<RadixSelect.Content className={styleClasses.rzSelectContent}>
				<RadixSelect.Viewport className={styleClasses.rzSelectViewport}>
					{options.map(option => (
						<RadixSelect.Item
							key={option.value as unknown as string}
							value={option.value as unknown as string}
							className={styleClasses.rzSelectItem}
						>
							<RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
							<RadixSelect.ItemIndicator className={styleClasses.rzSelectItemIndicator} />
						</RadixSelect.Item>
					))}
				</RadixSelect.Viewport>
			</RadixSelect.Content>
		</RadixSelect.Root>
	);
}
