// frontend/src/types/ears.ts
export const EARS_TYPES = {
    UBIQUITOUS: 'ubiquitous',
    EVENT_DRIVEN: 'event-driven',
    STATE_DRIVEN: 'state-driven',
    UNWANTED_BEHAVIOR: 'unwanted',
    OPTIONAL_FEATURE: 'optional',
    COMPLEX: 'complex',
} as const;

export type EarsType = typeof EARS_TYPES[keyof typeof EARS_TYPES];

export interface EarsTemplate {
    pattern: EarsType;
    template: string;
    description: string;
    example: string;
}

export interface EarsValidation {
    valid: boolean;
    message: string;
    suggestions: string[];
    detected_pattern?: string;
    components?: Record<string, string>;
}

export interface EarsTemplatesResponse {
    templates: Record<string, string>;
    descriptions: Record<string, string>;
}
