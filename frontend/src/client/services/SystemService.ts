/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpgradeRequest } from '../models/UpgradeRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemService {
    /**
     * Get System Info
     * Get system version information.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getSystemInfoApiV1SystemInfoGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/system/info',
        });
    }
    /**
     * Get Dependencies
     * Get dependency information for frontend and backend.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDependenciesApiV1SystemDependenciesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/system/dependencies',
        });
    }
    /**
     * Analyze Dependency
     * Perform a detailed dry-run check to identify potential compatibility issues.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static analyzeDependencyApiV1SystemDependenciesAnalyzePost(
        requestBody: UpgradeRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/system/dependencies/analyze',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Changelog
     * Get the content of CHANGELOG.md
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getChangelogApiV1SystemChangelogGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/system/changelog',
        });
    }
    /**
     * Upgrade Dependency
     * Perform a dry-run compatibility check and then upgrade if safe.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static upgradeDependencyApiV1SystemDependenciesUpgradePost(
        requestBody: UpgradeRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/system/dependencies/upgrade',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
