import { ButtonHTMLAttributes } from 'react'; 
import styles from './button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
}

export function Button({ title, ...rest }: ButtonProps): JSX.Element {
    return (
        <button className={styles.button} {...rest} >
            <span>{title}</span>
        </button>
    )
}