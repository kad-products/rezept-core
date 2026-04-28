'use client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Form, Select as RadixSelect } from 'radix-ui';
import { useFieldContext } from '../context';

interface SelectProps<T = string> {
	label: string;
	options: Array<{ value: T; label: string }>;
	required?: boolean;
}

export function Select<T = string>({ label, options, required }: SelectProps<T>): React.ReactNode {
	const field = useFieldContext<T>();

	return (
		<Form.Field className="rz-form-field" name={field.name}>
			<Form.Label className="rz-form-label">
				{label}
				{required && <span className="rz-form-input-required">*</span>}
			</Form.Label>
			{!field.state.meta.isValid && (
				<div className="rz-form-field-error">
					{field.state.meta.errors.map(error => (
						<Form.Message key={error.code} className="rz-form-message" forceMatch={true}>
							{error.message}
						</Form.Message>
					))}
				</div>
			)}
			<Form.Control asChild>
				<RadixSelect.Root
					onValueChange={(value: string): void => field.handleChange(value as T)}
					value={field.state.value as unknown as string}
				>
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
			</Form.Control>
		</Form.Field>
	);
}
