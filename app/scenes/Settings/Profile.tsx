import { observer } from "mobx-react";
import { ProfileIcon } from "outline-icons";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import Button from "~/components/Button";
import Heading from "~/components/Heading";
import Input from "~/components/Input";
import Scene from "~/components/Scene";
import Text from "~/components/Text";
import useCurrentUser from "~/hooks/useCurrentUser";
import useStores from "~/hooks/useStores";
import ImageInput from "./components/ImageInput";
import SettingRow from "./components/SettingRow";

const Profile = () => {
  const { auth } = useStores();
  const user = useCurrentUser();
  const form = React.useRef<HTMLFormElement>(null);
  const [name, setName] = React.useState<string>(user.name || "");
  const [oldPw, setOldPw] = React.useState<string>("");
  const [newPw1, setNewPw1] = React.useState<string>("");
  const [newPw2, setNewPw2] = React.useState<string>("");
  const { t } = useTranslation();

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault();

    try {
      if (oldPw || newPw1 || newPw2) {
        if (!oldPw || !newPw1 || !newPw2) {
          throw new Error(t("All passwords must be filled"));
        }

        if (newPw1 !== newPw2) {
          throw new Error(t("New passwords do not match."));
        }
      }

      await auth.updateUser({
        name,
        oldPassword: oldPw,
        newPassword: newPw1,
      });
      toast.success(t("Profile saved"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOldPw("");
      setNewPw1("");
      setNewPw2("");
    }
  };

  const handleNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setName(ev.target.value);
  };

  const handleOldPasswordChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setOldPw(ev.target.value);
  };

  const handleNewPasswordChange1 = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPw1(ev.target.value);
  };

  const handleNewPasswordChange2 = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPw2(ev.target.value);
  };

  const handleAvatarUpload = async (avatarUrl: string) => {
    await auth.updateUser({
      avatarUrl,
    });
    toast.success(t("Profile picture updated"));
  };

  const handleAvatarError = (error: string | null | undefined) => {
    toast.error(error || t("Unable to upload new profile picture"));
  };

  const isValid = form.current?.checkValidity();
  const { isSaving } = auth;

  return (
    <Scene title={t("Profile")} icon={<ProfileIcon />}>
      <Heading>{t("Profile")}</Heading>
      <Text type="secondary">
        <Trans>Manage how you appear to other members of the workspace.</Trans>
      </Text>

      <form onSubmit={handleSubmit} ref={form}>
        <SettingRow
          label={t("Photo")}
          name="avatarUrl"
          description={t("Choose a photo or image to represent yourself.")}
        >
          <ImageInput
            onSuccess={handleAvatarUpload}
            onError={handleAvatarError}
            model={user}
          />
        </SettingRow>
        <SettingRow
          label={t("Name")}
          name="name"
          description={t(
            "This could be your real name, or a nickname — however you’d like people to refer to you."
          )}
        >
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={handleNameChange}
            required
          />
        </SettingRow>
        <SettingRow
          border={false}
          label={t("Password")}
          name="password"
          description={t(
            `Set a new password for your account. It must be at least 8 caracters long and 
            contain a small and capital letter, a number and a special symbol.`
          )}
        >
          <div>
            <Input
              id="old-password"
              type="password"
              placeholder={t("Current password")}
              value={oldPw}
              onChange={handleOldPasswordChange}
            />
            <Input
              id="new-password-1"
              type="password"
              placeholder={t("New password")}
              value={newPw1}
              onChange={handleNewPasswordChange1}
            />
            <Input
              id="new-password-2"
              type="password"
              placeholder={t("Confirm new password")}
              value={newPw2}
              onChange={handleNewPasswordChange2}
            />
          </div>
        </SettingRow>
        <Button type="submit" disabled={isSaving || !isValid}>
          {isSaving ? `${t("Saving")}…` : t("Save")}
        </Button>
      </form>
    </Scene>
  );
};

export default observer(Profile);
