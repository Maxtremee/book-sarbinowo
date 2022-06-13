import { Button } from "@mantine/core";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export default function GoBackButton({ style }: { style?: any }) {
  const { t } = useTranslation();
  return (
    <Button
      style={style}
      component={Link}
      to=".."
    >
      {t("goBack")}
    </Button>
  );
}
