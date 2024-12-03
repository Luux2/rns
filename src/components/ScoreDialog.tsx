const ScoreDialog = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (points: number) => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-lg p-4 w-80">
                <h2 className="text-center text-xl font-bold mb-4">Vælg point</h2>
                <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 33 }, (_, i) => (
                        <button
                            key={i}
                            className="p-2 border rounded-lg text-center hover:bg-gray-200"
                            onClick={() => onSave(i)}
                        >
                            {i}
                        </button>
                    ))}
                </div>
                <button
                    className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg w-full"
                    onClick={onClose}
                >
                    Annuller
                </button>
            </div>
        </div>
    );
};

export default ScoreDialog;
