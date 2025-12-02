// frontend/src/components/EarsValidationIndicator.tsx
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { RequirementsService } from '../client';

interface Props {
    text: string;
    patternType: string;
}

export default function EarsValidationIndicator({ text, patternType }: Props) {
    const { data: validation } = useQuery({
        queryKey: ['ears-validate', text, patternType],
        queryFn: async () => {
            return await RequirementsService.validateEarsRequirementApiV1RequirementsEarsValidatePost({
                text,
                pattern: patternType as any
            });
        },
        enabled: !!text && text.length > 10,
        staleTime: 1000,
    });

    if (!validation) return null;

    return (
        <div className={`p-3 rounded-md ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
            <div className="flex items-start gap-2">
                {validation.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                    <p className={`text-sm font-medium ${validation.valid ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                        {validation.message}
                    </p>

                    {validation.detected_pattern && validation.detected_pattern !== patternType && (
                        <p className="text-xs text-gray-600 mt-1">
                            Detected pattern: <span className="font-medium">{validation.detected_pattern}</span>
                        </p>
                    )}

                    {validation.suggestions && validation.suggestions.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {validation.suggestions.map((suggestion: string, idx: number) => (
                                <li key={idx} className="text-xs text-gray-700">
                                    • {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
