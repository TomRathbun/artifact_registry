import React from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonLabel?: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    buttonLabel = 'OK'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-slate-800">{title}</h2>
                <p className="text-slate-600 mb-6">{message}</p>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
