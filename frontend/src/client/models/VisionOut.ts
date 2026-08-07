/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status } from './Status';
export type VisionOut = {
    title: string;
    /**
     * Supports Markdown formatting
     */
    description: string;
    area?: (string | null);
    project_id: string;
    aid: string;
    status?: (Status | null);
    created_date?: (string | null);
    last_updated?: (string | null);
};

