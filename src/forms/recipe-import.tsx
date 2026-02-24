'use client';

import { useRef, useState } from 'react';

type CFR2PutResponse = {
	key: string;
};

export default function FileUploadForm() {
	const [preview, setPreview] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = e.target.files?.[0];
		if (!selected) return;

		if (preview) URL.revokeObjectURL(preview); // revoke previous before replacing

		setFile(selected);

		// Generate preview URL from the local file — no upload yet
		const objectUrl = URL.createObjectURL(selected);
		setPreview(objectUrl);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!file) return;

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/recipes/import', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) throw new Error('Upload failed');

			const response: CFR2PutResponse = await res.json();
			if (!response.key) {
				throw new Error(`No key returned`);
			}
			console.log('Uploaded to:', response.key);

			// Reset form
			if (preview) URL.revokeObjectURL(preview);
			setFile(null);
			setPreview(null);
			if (inputRef.current) inputRef.current.value = '';
		} finally {
			setUploading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<input ref={inputRef} type="file" onChange={handleChange} />

			{preview && <img src={preview} alt="Preview" style={{ maxWidth: 300, marginTop: 8 }} />}

			<button type="submit" disabled={!file || uploading}>
				{uploading ? 'Uploading...' : 'Upload'}
			</button>
		</form>
	);
}
