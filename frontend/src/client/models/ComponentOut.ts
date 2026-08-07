/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComponentRelationshipOut } from './ComponentRelationshipOut';
export type ComponentOut = {
    id: string;
    name: string;
    type: string;
    description?: (string | null);
    'x'?: (number | null);
    'y'?: (number | null);
    tags?: (Array<string> | null);
    lifecycle?: (string | null);
    project_id?: (string | null);
    children?: Array<ComponentRelationshipOut>;
};

