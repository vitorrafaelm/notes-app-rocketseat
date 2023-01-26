import { Routes, Route, useNavigate } from "react-router-dom";
import nookies, { parseCookies } from 'nookies'

import { Register } from "../pages/register";
import { Login } from "../pages/login";
import { Home } from "../pages/home";
import { useUser } from "../contexts/userContext";
import { useEffect } from "react";

export const Router = () => {
  const { user } = useUser();
  const navigation = useNavigate();
  const cookies = nookies.get();

  useEffect(() => {
    if (!cookies.auth) {
      navigation("login");
    }
  }, [user, cookies?.auth]);

  return (
    <Routes>
      {cookies && <Route path="/home" element={<Home />} />}

      <Route index element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};
