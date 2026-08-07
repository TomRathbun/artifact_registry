/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VisionCreate } from '../models/VisionCreate';
import type { VisionOut } from '../models/VisionOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VisionsService {
    /**
     * List Vision Statements
     * @param projectId Filter by project ID
     * @param search Keyword search in title/description
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static listVisionStatementsApiV1VisionsGet(
        projectId: string,
        search?: (string | null),
    ): CancelablePromise<Array<VisionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/visions/',
            query: {
                'project_id': projectId,
                'search': search,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Vision Statements
     * @param projectId Filter by project ID
     * @param search Keyword search in title/description
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static listVisionStatementsApiV1VisionsGet1(
        projectId: string,
        search?: (string | null),
    ): CancelablePromise<Array<VisionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/visions/',
            query: {
                'project_id': projectId,
                'search': search,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Vision Statement
     * @param requestBody
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static createVisionStatementApiV1VisionsPost(
        requestBody: VisionCreate,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/visions/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Vision Statement
     * @param requestBody
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static createVisionStatementApiV1VisionsPost1(
        requestBody: VisionCreate,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/visions/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Vision Statement
     * @param aid
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static getVisionStatementApiV1VisionsAidGet(
        aid: string,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/visions/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Vision Statement
     * @param aid
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static getVisionStatementApiV1VisionsAidGet1(
        aid: string,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/visions/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Vision Statement
     * @param aid
     * @param requestBody
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static updateVisionStatementApiV1VisionsAidPut(
        aid: string,
        requestBody: VisionCreate,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/visions/{aid}',
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
     * Update Vision Statement
     * @param aid
     * @param requestBody
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static updateVisionStatementApiV1VisionsAidPut1(
        aid: string,
        requestBody: VisionCreate,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/visions/{aid}',
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
     * Delete Vision Statement
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteVisionStatementApiV1VisionsAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/visions/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Vision Statement
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteVisionStatementApiV1VisionsAidDelete1(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/visions/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
