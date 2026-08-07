/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EARSTemplateResponse } from '../models/EARSTemplateResponse';
import type { EARSValidationRequest } from '../models/EARSValidationRequest';
import type { EARSValidationResponse } from '../models/EARSValidationResponse';
import type { RequirementCreate } from '../models/RequirementCreate';
import type { RequirementOut } from '../models/RequirementOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RequirementsService {
    /**
     * Get Ears Templates
     * Get all EARS pattern templates and descriptions.
     * @returns EARSTemplateResponse Successful Response
     * @throws ApiError
     */
    public static getEarsTemplatesApiV1RequirementsEarsTemplatesGet(): CancelablePromise<EARSTemplateResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/requirements/ears/templates',
        });
    }
    /**
     * Get Ears Templates
     * Get all EARS pattern templates and descriptions.
     * @returns EARSTemplateResponse Successful Response
     * @throws ApiError
     */
    public static getEarsTemplatesApiV1RequirementsEarsTemplatesGet1(): CancelablePromise<EARSTemplateResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/requirements/ears/templates',
        });
    }
    /**
     * Validate Ears Requirement
     * Validate a requirement text against an EARS pattern.
     * Returns validation result with suggestions if invalid.
     * @param requestBody
     * @returns EARSValidationResponse Successful Response
     * @throws ApiError
     */
    public static validateEarsRequirementApiV1RequirementsEarsValidatePost(
        requestBody: EARSValidationRequest,
    ): CancelablePromise<EARSValidationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/requirements/ears/validate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Validate Ears Requirement
     * Validate a requirement text against an EARS pattern.
     * Returns validation result with suggestions if invalid.
     * @param requestBody
     * @returns EARSValidationResponse Successful Response
     * @throws ApiError
     */
    public static validateEarsRequirementApiV1RequirementsEarsValidatePost1(
        requestBody: EARSValidationRequest,
    ): CancelablePromise<EARSValidationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/requirements/ears/validate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Requirements
     * List all requirements with optional filtering.
     * @param projectId Filter by project ID
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., Draft)
     * @param owner Filter by owner
     * @param level Filter by level (e.g., STK)
     * @param earsType Filter by EARS type (e.g., SYS)
     * @param search Keyword search in short_name/text
     * @param selectAll Ignore all filters and return everything
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static listRequirementsApiV1RequirementsGet(
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
            url: '/api/v1/requirements/',
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
     * List Requirements
     * List all requirements with optional filtering.
     * @param projectId Filter by project ID
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., Draft)
     * @param owner Filter by owner
     * @param level Filter by level (e.g., STK)
     * @param earsType Filter by EARS type (e.g., SYS)
     * @param search Keyword search in short_name/text
     * @param selectAll Ignore all filters and return everything
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static listRequirementsApiV1RequirementsGet1(
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
            url: '/api/v1/requirements/',
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
    public static createRequirementApiV1RequirementsPost(
        requestBody: RequirementCreate,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/requirements/',
            body: requestBody,
            mediaType: 'application/json',
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
    public static createRequirementApiV1RequirementsPost1(
        requestBody: RequirementCreate,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/requirements/',
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
     * Includes source_use_case_id from linkage.
     * @param aid
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getRequirementApiV1RequirementsAidGet(
        aid: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/requirements/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Requirement
     * Retrieve a single requirement by its artifact identifier (aid).
     * Includes source_use_case_id from linkage.
     * @param aid
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getRequirementApiV1RequirementsAidGet1(
        aid: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/requirements/{aid}',
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
    public static updateRequirementApiV1RequirementsAidPut(
        aid: string,
        requestBody: RequirementCreate,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/requirements/{aid}',
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
     * Update Requirement
     * Partial update of an existing requirement. Only fields present in the payload
     * are changed; `last_updated` is refreshed automatically.
     * @param aid
     * @param requestBody
     * @returns RequirementOut Successful Response
     * @throws ApiError
     */
    public static updateRequirementApiV1RequirementsAidPut1(
        aid: string,
        requestBody: RequirementCreate,
    ): CancelablePromise<RequirementOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/requirements/{aid}',
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
     * Permanently delete a requirement and all associated linkages.
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteRequirementApiV1RequirementsAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/requirements/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Requirement
     * Permanently delete a requirement and all associated linkages.
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteRequirementApiV1RequirementsAidDelete1(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/requirements/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
