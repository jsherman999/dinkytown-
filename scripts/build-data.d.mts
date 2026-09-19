import type { Bundle } from '../src/types';
export function parseCsv(text: string): Record<string, string>[];
export function buildBundle(dir?: string): { bundle: Bundle; errors: string[]; warnings: string[] };
