import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { s } from "@shared/styles";
import ButtonLarge from "~/components/ButtonLarge";
import InputLarge from "~/components/InputLarge";

function PasswordProvider() {
  const { t } = useTranslation();

  const [password, setPassword] = React.useState<string>("");
  const [email, setEmail] = React.useState("");

  const handleEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value);
  };

  const handlePasswordChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(ev.target.value);
  };

  return (
    <Form method="POST" action="/auth/password">
      <InputLogin
        type="email"
        placeholder="E-Mail"
        name="email"
        value={email}
        onChange={handleEmailChange}
        required
      />
      <InputLogin
        type="password"
        placeholder="Password"
        name="password"
        value={password}
        onChange={handlePasswordChange}
        required
      />
      <ResetLink href="/forgot-password">{t("Forgot password?")}</ResetLink>
      <ButtonLarge fullwidth type="submit">
        Login
      </ButtonLarge>

      <Or data-text={t("Or")} />
    </Form>
  );
}

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const InputLogin = styled(InputLarge)`
  margin-right: 0px;
`;

const ResetLink = styled.a`
  align-self: end;
  margin-bottom: 16px;
  margin-top: -8px;
`;

const Or = styled.hr`
  margin: 1em 0;
  position: relative;
  width: 100%;

  &:after {
    content: attr(data-text);
    display: block;
    position: absolute;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    text-transform: uppercase;
    font-size: 11px;
    color: ${s("textSecondary")};
    background: ${s("background")};
    border-radius: 2px;
    padding: 0 4px;
  }
`;

export default PasswordProvider;
