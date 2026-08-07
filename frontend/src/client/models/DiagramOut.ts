/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiagramComponentOut } from './DiagramComponentOut';
import type { DiagramEdgeOut } from './DiagramEdgeOut';
export type DiagramOut = {
    id: string;
    project_id: string;
    name: string;
    description?: (string | null);
    type: string;
    content?: (string | null);
    filter_data?: (Record<string, any> | null);
    created_at?: (string | null);
    updated_at?: (string | null);
    components?: Array<DiagramComponentOut>;
    edges?: Array<DiagramEdgeOut>;
};

