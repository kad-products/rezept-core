export type RzTableColumn = {
	label: string;
	key: string;
	render?: (val: string) => string;
};
