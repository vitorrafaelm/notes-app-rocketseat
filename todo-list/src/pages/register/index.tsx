import { HeaderLogout } from "../../components/headerLogout";
import { Link } from "react-router-dom";
import styles from "./register.module.css";

import Logo from "../../assets/logo.png";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { FormEvent, useRef } from "react";
import { apiFirebase } from "../../services/api";
import { useUser } from "../../contexts/userContext";

export function Register(): JSX.Element {
  const { login } = useUser(); 

  const nameRef = useRef<HTMLInputElement>();
  const emailRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();

  async function register(event: FormEvent) {
    event.preventDefault();
    const name = nameRef.current?.value; 
    const email = emailRef.current?.value; 
    const password = passwordRef.current?.value; 

    const nameVerified = typeof name === 'string' && name.length > 0; 
    const emailVerified = typeof email === 'string' && email.length > 0;
    const passwordVerified = typeof password === 'string' && password.length > 0;

    
    if(nameVerified && emailVerified && passwordVerified) {
      const response = await apiFirebase.post('/createUser', {
        data: {
          name: name, 
          email: email, 
          password: password,
        }
      }); 

      if(response.status === 200) {
        await login(email, password); 
      }
    }
  }

  return (
    <main>
      <Link to="/login" style={{ textDecoration: 'none '}}>
        <HeaderLogout buttonTitle="Entrar" buttonOnClickButton={() => {}} />
      </Link>

      <div className={styles.container}>
        <div className={styles.loginbox}>
          <img src={Logo} alt="Logo" />

          <form>
            <Input
              placeholder="Digite o seu nome"
              name="name"
              id="name"
              required
              type='text'
              minLength={3}
              ref={nameRef}
            />
            <Input
              placeholder="Digite o seu E-mail"
              name="email"
              id="email"
              required
              type='email'
              minLength={20}
              ref={emailRef}
            />
            <Input
              placeholder="Digite a sua senha"
              type="password"
              name="password"
              id="password"
              minLength={6}
              ref={passwordRef}
            />

            <div className={styles.buttonBox}>
              <Button title="Cadastrar" onClick={register} />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
