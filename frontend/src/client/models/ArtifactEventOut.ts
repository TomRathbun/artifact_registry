/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ArtifactEventOut = {
    id: number;
    artifact_type: string;
    artifact_id: string;
    event_type: string;
    event_data: Record<string, any>;
    timestamp: string;
    user_id?: string;
    user_name?: string;
    comment?: string;
};
