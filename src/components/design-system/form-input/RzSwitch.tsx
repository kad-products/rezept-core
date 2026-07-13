'use client';
import { Switch } from 'radix-ui';
import styleClasses from './rz-switch.module.css';

export function RzSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }): React.ReactNode {
	return (
		<Switch.Root
			onCheckedChange={onChange}
			value={checked as unknown as string}
			defaultChecked={checked}
			className={styleClasses.rzSwitchRoot}
		>
			<Switch.Thumb className={styleClasses.rzSwitchThumb} />
		</Switch.Root>
	);
}
