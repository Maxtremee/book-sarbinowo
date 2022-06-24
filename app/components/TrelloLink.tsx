import { Anchor } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function TrelloLink() {
  const { t } = useTranslation();
  return (
    <Anchor
      size="xs"
      align="center"
      style={{display: "block"}}
      href="https://trello.com/b/WpaVJm9G/book-sarbinowo"
      target="_blank"
    >
      {t("idea")}
    </Anchor>
  );
}
