import * as React from "react";
import BaseEmail from "./BaseEmail";
import Body from "./components/Body";
import Button from "./components/Button";
import EmailTemplate from "./components/EmailLayout";
import EmptySpace from "./components/EmptySpace";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Heading from "./components/Heading";

type Props = {
  to: string;
  name: string;
  teamName: string;
  resetUrl: string;
};

/**
 * Email sent to a user when their account has just been created, or they signed
 * in for the first time from an invite.
 */
export default class ResetPasswordEmail extends BaseEmail<Props> {
  protected subject() {
    return "Password reset";
  }

  protected preview() {
    return "Your password reset link";
  }

  protected renderAsText({
    name,
    teamName,
    resetUrl 
  }: Props) {
    return `
Hello ${name}

You recently requested to reset the password for your ${teamName}’s knowledge base on Outline.

Please click this link to change your password:
${resetUrl}

If you did not request a password reset, please ignore this email or reply to let us know.
This password reset link is only valid for the next 30 minutes.

`;
  }

  protected render({ name, teamName, resetUrl }: Props) {
    return (
      <EmailTemplate>
        <Header />

        <Body>
          <Heading>Hello {name}</Heading>
          <p>
            You recently requested to reset the password for your {teamName}’s knowledge base on Outline.
          </p>
          <EmptySpace height={10} />
          <p>
            <Button href={`${resetUrl}`}>
              Reset your password
            </Button>
          </p>
          <p>
            If you did not request a password reset, please ignore this email or reply to let us know.
            This password reset link is only valid for the next 30 minutes.
          </p>
        </Body>

        <Footer />
      </EmailTemplate>
    );
  }
}
