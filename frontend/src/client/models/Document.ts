/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentType } from './DocumentType';
export type Document = {
    title: string;
    description?: (string | null);
    document_type?: DocumentType;
    content_url?: (string | null);
    content_text?: (string | null);
    mime_type?: (string | null);
    area?: (string | null);
    project_id: string;
    aid: string;
    created_date: string;
    last_updated: string;
    status: string;
};

