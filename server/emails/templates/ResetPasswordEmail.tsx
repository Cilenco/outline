import * as React from "react";
import env from "@server/env";
import BaseEmail, { EmailProps } from "./BaseEmail";
import Body from "./components/Body";
import Button from "./components/Button";
import EmailTemplate from "./components/EmailLayout";
import EmptySpace from "./components/EmptySpace";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Heading from "./components/Heading";

type Props = EmailProps & {
  userName: string;
  token: string;
};

/**
 * Email sent to a user when they forgot their password.
 */
export default class ResetPasswordEmail extends BaseEmail<Props> {
  protected subject() {
    return `Password reset for ${env.APP_NAME}`;
  }

  protected preview() {
    return `${env.APP_NAME} is a place for your team to build and share knowledge.`;
  }

  protected renderAsText({ token, userName }: Props) {
    return `
  Hello ${userName}!
  
  We received a request to change the password for your ${env.APP_NAME} account.
  Click on the link below to create a new password:

  ${token}

  The link will expire in 24 hours. After that you need to submit a new request in order to reset your password.
  If you did not request a password reset, you can ignore this email. Your password will not be changed!
  `;
  }

  protected render({ token, userName }: Props) {
    return (
      <EmailTemplate previewText={this.preview()}>
        <Header />

        <Body>
          <Heading>Hello {userName}!</Heading>
          <p>
            We received a request to change the password for your {env.APP_NAME}
            account. Click on the link below to create a new password:
          </p>
          <EmptySpace height={10} />
          <p>
            <Button href={token}>Reset your password</Button>
          </p>
          <EmptySpace height={10} />
          <p>
            The link will expire in 24 hours. After that you need to submit a
            new request in order to reset your password. If you did not request
            a password reset, you can ignore this email. Your password will not
            be changed!
          </p>
        </Body>

        <Footer />
      </EmailTemplate>
    );
  }
}
