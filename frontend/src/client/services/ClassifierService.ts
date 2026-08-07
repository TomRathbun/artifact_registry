/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClassificationRequest } from '../models/ClassificationRequest';
import type { ClassificationResponse } from '../models/ClassificationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClassifierService {
    /**
     * Classify Requirement
     * Classify a requirement text using the LSTM model
     *
     * Returns probabilities for each classification category:
     * - is_vague
     * - is_compound
     * - is_untestable
     * - is_incomplete
     * - is_poorly_structured
     * @param requestBody
     * @returns ClassificationResponse Successful Response
     * @throws ApiError
     */
    public static classifyRequirementApiV1ClassifierClassifyPost(
        requestBody: ClassificationRequest,
    ): CancelablePromise<ClassificationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/classifier/classify',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Health Check
     * Check if the classifier model is loaded and ready
     * @returns any Successful Response
     * @throws ApiError
     */
    public static healthCheckApiV1ClassifierHealthGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/classifier/health',
        });
    }
}
