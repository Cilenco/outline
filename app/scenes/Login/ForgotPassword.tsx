import { observer } from "mobx-react";
import { BackIcon } from "outline-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import breakpoint from "styled-components-breakpoint";
import { s } from "@shared/styles";
import ButtonLarge from "~/components/ButtonLarge";
import Fade from "~/components/Fade";
import Flex from "~/components/Flex";
import Heading from "~/components/Heading";
import OutlineIcon from "~/components/Icons/OutlineIcon";
import InputLarge from "~/components/InputLarge";
import NudeButton from "~/components/NudeButton";
import PageTitle from "~/components/PageTitle";
import Text from "~/components/Text";
import { draggableOnDesktop } from "~/styles";
import Desktop from "~/utils/Desktop";
import Notices from "./components/Notices";

function ForgotPassword() {
  const { t } = useTranslation();
  // const { auth } = useStores();
  // const { config } = auth;

  const [email, setEmail] = React.useState("");

  const handleEmailChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(ev.target.value);
  };

  const onClosePage = () => {
    window.location.href = "/";
  };

  return (
    <Background>
      <Back onClick={onClosePage}>
        <BackIcon size={32} />
        <Text as="span">{t("Back")} </Text>
      </Back>
      <Centered align="center" justify="center" gap={12} column auto>
        <PageTitle title={t("Reset password")} />
        <Logo>
          <OutlineIcon size={48} />
        </Logo>
        <StyledHeading as="h2" centered>
          {t("Request a new password")}
        </StyledHeading>
        <Form method="POST" action="/auth/password">
          <InputLogin
            type="email"
            placeholder="E-Mail"
            name="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <ButtonLarge fullwidth type="submit">
            {t("Reset password")}
          </ButtonLarge>
        </Form>
        <Notices />
      </Centered>
    </Background>
  );
}

const Back = styled(NudeButton)`
  position: absolute;
  display: none;
  align-items: center;
  top: ${Desktop.hasInsetTitlebar() ? "3rem" : "2rem"};
  left: 2rem;
  opacity: 0.75;
  color: ${s("text")};
  font-weight: 500;
  width: auto;
  height: auto;

  &:hover {
    opacity: 1;
  }

  ${breakpoint("tablet")`
    display: flex;
  `};
`;

const Background = styled(Fade)`
  width: 100vw;
  height: 100%;
  background: ${s("background")};
  display: flex;
  ${draggableOnDesktop()}
`;

const Centered = styled(Flex)`
  user-select: none;
  width: 90vw;
  height: 100%;
  max-width: 320px;
  margin: 0 auto;
`;

const Logo = styled.div`
  margin-bottom: -4px;
`;

const StyledHeading = styled(Heading)`
  margin: 0;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const InputLogin = styled(InputLarge)`
  margin-right: 0px;
`;

export default observer(ForgotPassword);
