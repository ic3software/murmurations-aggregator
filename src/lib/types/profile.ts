export interface ProfileData {
	[key: string]: string | number | boolean | Date | null | ProfileData | ProfileData[];
}
