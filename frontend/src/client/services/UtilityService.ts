/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AIDRename } from '../models/AIDRename';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UtilityService {
    /**
     * Suggest Aid
     * @param artifactType
     * @param area
     * @param projectId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static suggestAidApiV1UtilitySuggestAidGet(
        artifactType: string,
        area: string,
        projectId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/utility/suggest-aid',
            query: {
                'artifact_type': artifactType,
                'area': area,
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Rename Aid
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static renameAidApiV1UtilityRenameAidPost(
        requestBody: AIDRename,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/utility/rename-aid',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
