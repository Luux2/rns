import {useEffect, useState, ReactNode, FC} from "react";

interface AnimationProps {
    children: ReactNode;
}

const Animation: FC<AnimationProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(false);
        setTimeout(() => {
            setIsVisible(true);
        }, 100);
    }, []);

    return (
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {children}
        </div>
    );
};

export default Animation;
