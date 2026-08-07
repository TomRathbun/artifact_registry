/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response model for EARS validation
 */
export type EARSValidationResponse = {
    valid: boolean;
    message: string;
    suggestions: Array<string>;
    detected_pattern?: (string | null);
    components?: (Record<string, string> | null);
};

