import {ChangeEvent, useState} from "react";

export const ExitDialog = ({ handleConfirm, onCancel }: {
    handleConfirm: () => void
    onCancel: () => void
}) => {
    const password = "4747";
    const [inputPassword, setInputPassword] = useState("");
    const [error, setError] = useState("");

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputPassword(e.target.value);
        if (error) setError("");
    };

    const handleButtonClick = () => {
        if (inputPassword === password) {
            handleConfirm();
        } else {
            setError("Forkert adgangskode");
        }
    };

    return (
        <div className="overflow-hidden rounded-lg shadow-2xl bg-white p-4 text-black flex flex-col gap-4">
            <label className="text-xl font-bold" htmlFor="password">Indtast adgangskode</label>
            <input
                type="password"
                id="password"
                value={inputPassword}
                onChange={handleInputChange}
                className="border rounded p-2"
            />

            {error && <p className="text-red-500">{error}</p>}

            <button
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                onClick={onCancel}
            >
                Annuller
            </button>

            <button
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                onClick={handleButtonClick}
            >
                Bekræft
            </button>
        </div>
    );
};

export default ExitDialog;
