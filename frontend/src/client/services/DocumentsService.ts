/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_file_api_v1_documents_upload_post } from '../models/Body_upload_file_api_v1_documents_upload_post';
import type { Document } from '../models/Document';
import type { DocumentCreate } from '../models/DocumentCreate';
import type { DocumentUpdate } from '../models/DocumentUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DocumentsService {
    /**
     * Read Documents
     * @param skip
     * @param limit
     * @param projectId
     * @returns Document Successful Response
     * @throws ApiError
     */
    public static readDocumentsApiV1DocumentsGet(
        skip?: number,
        limit: number = 100,
        projectId?: string,
    ): CancelablePromise<Array<Document>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/documents/',
            query: {
                'skip': skip,
                'limit': limit,
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Document
     * @param requestBody
     * @returns Document Successful Response
     * @throws ApiError
     */
    public static createDocumentApiV1DocumentsPost(
        requestBody: DocumentCreate,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/documents/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload File
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadFileApiV1DocumentsUploadPost(
        formData: Body_upload_file_api_v1_documents_upload_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/documents/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Serve File
     * @param filename
     * @returns any Successful Response
     * @throws ApiError
     */
    public static serveFileApiV1DocumentsFilesFilenameGet(
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/documents/files/{filename}',
            path: {
                'filename': filename,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Document
     * @param aid
     * @returns Document Successful Response
     * @throws ApiError
     */
    public static readDocumentApiV1DocumentsAidGet(
        aid: string,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/documents/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Document
     * @param aid
     * @param requestBody
     * @returns Document Successful Response
     * @throws ApiError
     */
    public static updateDocumentApiV1DocumentsAidPut(
        aid: string,
        requestBody: DocumentUpdate,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/documents/{aid}',
            path: {
                'aid': aid,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Document
     * @param aid
     * @returns Document Successful Response
     * @throws ApiError
     */
    public static deleteDocumentApiV1DocumentsAidDelete(
        aid: string,
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/documents/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
