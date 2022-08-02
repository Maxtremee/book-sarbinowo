import { Button } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { ArrowBack } from "tabler-icons-react";

export default function GoBackButton({
  style,
  goTo,
}: {
  style?: any;
  goTo?: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Button
      leftIcon={<ArrowBack />}
      style={style}
      onClick={() => (goTo ? navigate(goTo) : navigate(-1))}
      type="button"
    >
      {t("goBack")}
    </Button>
  );
}
