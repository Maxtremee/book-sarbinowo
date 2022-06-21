import { Button } from "@mantine/core";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { ArrowBack } from "tabler-icons-react";

export default function GoBackButton({ style }: { style?: any }) {
  const { t } = useTranslation();
  return (
    <Button leftIcon={<ArrowBack />} style={style} component={Link} to="..">
      {t("goBack")}
    </Button>
  );
}
