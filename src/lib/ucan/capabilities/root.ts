import type { Capability } from '@ucans/ucans';

export function rootCapability(): Capability {
	return {
		with: { scheme: 'api', hierPart: '*' },
		can: { namespace: '*', segments: ['*'] }
	};
}
