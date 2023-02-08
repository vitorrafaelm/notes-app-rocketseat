import { Link } from 'react-router-dom';
import { Button } from "../button";

import styles from './headerLogo.module.css';
import Logo from '../../assets/logo.png';

interface HeaderLogoutProps {
    buttonTitle: string; 
    buttonOnClickButton: () => void;
}

export function HeaderLogout({ buttonTitle, buttonOnClickButton }: HeaderLogoutProps): JSX.Element {
    const identifyScreen = /entrar/gmi.exec(buttonTitle); 

    return (
        <header className={styles.header}>
            <img src={Logo} alt="Logo" />
            <Link to={!identifyScreen ? '/' : '/login'} style={{ textDecoration: 'none' }}>
                <Button title={buttonTitle} onClick={buttonOnClickButton} />
            </Link>
        </header>
    )
}