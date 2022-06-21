import { Anchor } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function TrelloLink() {
  const { t } = useTranslation();
  return (
    <Anchor
      style={{ maxWidth: "85vw" }}
      size="xs"
      align="center"
      href="https://trello.com/b/WpaVJm9G/book-sarbinowo"
      target="_blank"
    >
      {t("idea")}
    </Anchor>
  );
}
