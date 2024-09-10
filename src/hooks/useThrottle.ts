import { useState } from "react";
export default function useThrottle() {
    const [canRun, setCanRun] = useState(true);
    const throttle = (callback: () => any, delay = 300) => {
        if (canRun) {
            setCanRun(false);
            callback();
            setTimeout(() => {
                setCanRun(true);
            }, delay);
        }
    };
    return throttle;
}
