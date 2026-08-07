/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LinkType } from './LinkType';
export type LinkageOut = {
    source_artifact_type?: (string | null);
    source_id?: (string | null);
    target_artifact_type?: (string | null);
    target_id?: (string | null);
    relationship_type: LinkType;
    project_id?: (string | null);
    aid: string;
};

