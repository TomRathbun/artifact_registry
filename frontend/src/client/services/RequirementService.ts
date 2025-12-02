/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RequirementCreate } from '../models/RequirementCreate';
import type { RequirementOut } from '../models/RequirementOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RequirementService {
    /**
     * List Requirements
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., proposed)
     * @param owner Filter by owner
     * @param level Filter by level (e.g., STK)
     * @param earsType Filter by EARS type (e.g., SYS)
     * @param selectAll Ignore all filters and return everything
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static listRequirementsApiV1RequirementRequirementsGet(
        projectId?: (string | null),
        area?: (Array<string> | null),
        status?: (Array<string> | null),
        owner?: (string | null),
        level?: (Array<string> | null),
        earsType?: (Array<string> | null),
        search?: (string | null),
        selectAll: boolean = false,
    ): CancelablePromise<Array<RequirementOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/requirement/requirements/',
            query: {
                'project_id': projectId,
                'area': area,
                'status': status,
                'owner': owner,
                'level': level,
                'ears_type': earsType,
                'search': search,
                'select_all': selectAll,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Requirement
     * @param requestBody
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static createRequirementApiV1RequirementRequirementsPost(
        requestBody: RequirementCreate,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/requirement/requirements/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Requirement
     * Retrieve a single requirement by its artifact identifier (aid).
     * @param aid
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static getRequirementApiV1RequirementRequirementsAidGet(
        aid: string,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/requirement/requirements/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Requirement
     * Partial update of an existing requirement. Only fields present in the payload
     * are changed; `last_updated` is refreshed automatically.
     * @param aid
     * @param requestBody
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static updateRequirementApiV1RequirementRequirementsAidPut(
        aid: string,
        requestBody: RequirementCreate,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/requirement/requirements/{aid}',
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
     * Delete Requirement
     * Permanently delete a requirement. All linkages that reference this
     * requirement should be cleaned up by the client or a cascade rule.
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteRequirementApiV1RequirementRequirementsAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/requirement/requirements/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
