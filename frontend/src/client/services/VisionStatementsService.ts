/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VisionCreate } from '../models/VisionCreate';
import type { VisionOut } from '../models/VisionOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VisionStatementsService {
    /**
     * List Vision Statements
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static listVisionStatementsApiV1VisionVisionStatementsGet(): CancelablePromise<Array<VisionOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/vision/vision-statements/',
        });
    }
    /**
     * Create Vision Statement
     * @param requestBody
     * @returns VisionOut Successful Response
     * @throws ApiError
     */
    public static createVisionStatementApiV1VisionVisionStatementsPost(
        requestBody: VisionCreate,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/vision/vision-statements/',
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
    public static getVisionStatementApiV1VisionVisionStatementsAidGet(
        aid: string,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/vision/vision-statements/{aid}',
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
    public static updateVisionStatementApiV1VisionVisionStatementsAidPut(
        aid: string,
        requestBody: VisionCreate,
    ): CancelablePromise<VisionOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/vision/vision-statements/{aid}',
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
    public static deleteVisionStatementApiV1VisionVisionStatementsAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/vision/vision-statements/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
