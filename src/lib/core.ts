function openCoreDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('core', 1);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains('auth')) {
				db.createObjectStore('auth');
			}
		};
		request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
		request.onerror = () => reject(request.error);
	});
}

export async function storeToken(key: 'rootToken' | 'currentToken', token: string | null) {
	const db = await openCoreDB();
	const tx = db.transaction('auth', 'readwrite');
	const store = tx.objectStore('auth');
	store.put(token, key);
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve(true);
		tx.onerror = () => reject(tx.error);
	});
}

export async function getToken(key: 'rootToken' | 'currentToken'): Promise<string | null> {
	if (typeof window === 'undefined' || !('indexedDB' in window)) {
		return null;
	}

	const db = await openCoreDB();
	const tx = db.transaction('auth', 'readonly');
	const store = tx.objectStore('auth');
	return new Promise((resolve, reject) => {
		const request = store.get(key);
		request.onsuccess = () => resolve(request.result || null);
		request.onerror = () => reject(request.error);
	});
}
