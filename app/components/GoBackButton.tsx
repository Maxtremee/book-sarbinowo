import { Button } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { ArrowBack } from "tabler-icons-react";

export default function GoBackButton({ style }: { style?: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate()
  return (
    <Button leftIcon={<ArrowBack />} style={style} onClick={() => navigate(-1)}>
      {t("goBack")}
    </Button>
  );
}
