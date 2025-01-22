export interface CurrentTemplateRegistry {
	[key: string]: {
		label: string;
		templates: Record<string, { label: string; hint?: string }>;
	};
}

export type CurrentRepository = `${string}/${string}`;
export type GigetRepoUrl = `${string}:${string}/${string}`;

export interface FilterRules {
	isStudioCMSProject: string;
	isWithStudioCMSRepo: string[];
}

export interface TemplateRegistry {
	defaultTemplate: string;
	gigetRepoUrl: GigetRepoUrl;
	currentRepositoryUrl: string;
	filterRules: FilterRules;
	currentProjects: Array<{ value: string; label: string; hint?: string }>;
	currentTemplates: {
		[key: string]: Array<{ value: string; label: string; hint?: string }>;
	};
}
