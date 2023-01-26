import { HeaderLogout } from "../../components/headerLogout";
import { Link } from "react-router-dom";
import styles from "./login.module.css";

import Logo from "../../assets/logo.png";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { useUser } from "../../contexts/userContext";
import { FormEvent, useRef } from "react";

export function Login(): JSX.Element {
  const { login } = useUser();

  const emailRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    const emailVerified = typeof email === "string" && email.length > 0;
    const passwordVerified =
      typeof password === "string" && password.length > 0;

    if (emailVerified && passwordVerified) {
      await login(email, password);
    }
  }

  return (
    <main>
      <HeaderLogout buttonTitle="Cadastrar" buttonOnClickButton={() => {}} />

      <div className={styles.container}>
        <div className={styles.loginbox}>
          <img src={Logo} alt="Logo" />

          <form action="">
            <Input
              placeholder="Digite o seu E-mail"
              type="email"
              required
              ref={emailRef}
            />
            <Input
              placeholder="Digite a sua senha"
              required
              ref={passwordRef}
              type="password"
            />

            <div className={styles.buttonBox}>
              <Link to="/home">
                <Button title="Entrar" onClick={handleLogin} />
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
