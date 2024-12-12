import React, { forwardRef } from 'react';


type StepButtonProps = {
    children?: React.ReactNode;
    onClick?: () => void;
};

export const StepButton = React.memo(forwardRef<HTMLButtonElement, StepButtonProps>(
( { children,onClick }: StepButtonProps,ref) => {
    return (
        <button ref={ref} className="border-2 border-black w-8 h-8"
            onClick={ onClick }
        >
            { children }
        </button>
    );
}
))
;