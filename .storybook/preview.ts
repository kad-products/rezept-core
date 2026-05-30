import type { Preview } from '@storybook/react';
import '../src/styles/global.css';

// Match app default — Document.tsx always renders <body class="dark">
document.body.classList.add('dark');

const preview: Preview = {
	parameters: {},
};

export default preview;
