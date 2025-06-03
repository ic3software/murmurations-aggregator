import type { Capability } from '@ucans/ucans';

export function emailCapability(action: 'create' | 'read' | 'delete', did: string): Capability {
	return {
		with: { scheme: 'mailto', hierPart: did },
		can: { namespace: 'email', segments: [action] }
	};
}
