import { forwardRef, InputHTMLAttributes } from 'react'; 

import styles from './input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    ref?: any;
}

function InputElement(props: InputProps, ref: any): JSX.Element {
    return (
        <input 
            className={styles.inputField} 
            type="text" 
            ref={ref}
            {...props}
        />
    )
}

export const Input = forwardRef(InputElement);