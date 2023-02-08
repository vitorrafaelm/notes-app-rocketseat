import { ButtonHTMLAttributes } from "react";
import { SpinnerCircular } from "spinners-react";

import styles from "./button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  loading?: boolean;
}

export function Button({ title, loading = false, ...rest }: ButtonProps): JSX.Element {
  return (
    <button className={styles.button} {...rest}>
       <p>{ loading ? <SpinnerCircular size={26} /> : title}</p>
    </button>
  );
}
