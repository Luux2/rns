import React from "react";

interface PointDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (point: number) => void;
}

const PointDialog: React.FC<PointDialogProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Vælg Point</h2>
                    <button
                        className="text-gray-500 hover:text-black"
                        onClick={onClose}
                    >
                        ✖
                    </button>
                </div>

                {/* Points */}
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 32 }, (_, i) => i + 1).map((point) => (
                        <button
                            key={point}
                            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => {
                                onSelect(point);
                                onClose();
                            }}
                        >
                            {point}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PointDialog;
