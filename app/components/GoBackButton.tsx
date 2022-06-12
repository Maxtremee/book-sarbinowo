import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export default function GoBackButton() {
  const {t} = useTranslation()
  return (
    <Link
      to=".."
      className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
    >
      {t("goBack")}
    </Link>
  );
}
