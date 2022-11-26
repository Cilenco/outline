import { EmailIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { parseDomain } from "@shared/utils/domains";
import AuthLogo from "~/components/AuthLogo";
import ButtonLarge from "~/components/ButtonLarge";
import InputLarge from "~/components/InputLarge";
import env from "~/env";
import { client } from "~/utils/ApiClient";

type Props = {
  hasExternalAuth: boolean;
};

function LocalAuthProvider(props: Props) {
  const { t } = useTranslation();
  const [isSubmitting, setSubmitting] = React.useState(false);
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  
  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (email && password) {
      setSubmitting(true);

      try {
        const response = await client.post(event.currentTarget.action, {
          email, password,
        });

        console.log(response.redirect);
        if (response.redirect) {
          window.location.href = response.redirect;
        }
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  return (
    <Wrapper>
      <Form method="POST" action="/auth/local" onSubmit={handleSubmit}>
          <>
            <LoginField
              type="email"
              name="email"
              placeholder={t("Email")}
              value={email}
              onChange={handleChangeEmail}
              disabled={isSubmitting}
              autoFocus
              required
            />
            <LoginField
              type="password"
              name="password"
              placeholder={t("Password")}
              value={password}
              onChange={handleChangePassword}
              disabled={isSubmitting}
              required
            />
            <ButtonLarge type="submit" fullwidth disabled={isSubmitting}>
              {t("Sign In")}
            </ButtonLarge>
          </>
      </Form>
      {props.hasExternalAuth ? (
        <Or data-text={t("Or")} />
      ) : (
        <>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
`;

const Form = styled.form`
  width: 100%;
  display: block;
`;

const LoginField = styled(InputLarge)`
  margin-right: 0px;
  margin-bottom: 16px;
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
    color: ${(props) => props.theme.textSecondary};
    background: ${(props) => props.theme.background};
    border-radius: 2px;
    padding: 0 4px;
  }
`;

export default LocalAuthProvider;
