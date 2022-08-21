import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
  useTransition,
} from "@remix-run/react";

import { requireUserId } from "~/session.server";
import {
  getUserReservationsOffset,
  getUserTotalReservations,
} from "~/models/reservation.server";
import ReservationList from "~/components/ReservationList";
import { useTranslation } from "react-i18next";
import {
  Group,
  LoadingOverlay,
  NativeSelect,
  Pagination,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import type { ChangeEvent } from "react";

function parseSwitchSearchParam(param: string | null) {
  if (param === "on") {
    return true;
  }
  return false;
}

export const loader = async ({ request }: LoaderArgs) => {
  const params = new URL(request.url).searchParams;
  const canceled = parseSwitchSearchParam(params.get("canceled"));
  const amount = parseInt(params.get("amount") as string) || 10;
  const page = parseInt(params.get("page") as string) || 1;
  const offset = (page - 1) * amount;

  const userId = await requireUserId(request);
  let [reservations, totalReservations] = await Promise.all([
    getUserReservationsOffset({ userId, amount, offset, canceled }),
    getUserTotalReservations({ userId, canceled }),
  ]);
  return json({ reservations, totalReservations });
};

export default function ReservationsHistoryPage() {
  const { reservations, totalReservations } = useLoaderData();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const transition = useTransition();
  const submit = useSubmit();

  const page = parseInt(searchParams.get("page") || "1");
  const amount = parseInt(searchParams.get("amount") || "10");
  const canceled = parseSwitchSearchParam(searchParams.get("canceled"));

  const handlePageChange = (page: number) => {
    const formData = new FormData();
    formData.set("page", page.toString());
    formData.set("amount", amount.toString());
    formData.set("canceled", canceled ? "on" : "off");
    submit(formData);
  };

  const handleCanceledChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.set("page", "1");
    formData.set("amount", amount.toString());
    formData.set("canceled", event.target.checked ? "on" : "off");
    submit(formData);
  };

  const handleAmountChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const formData = new FormData();
    formData.set("page", "1");
    formData.set("amount", event.currentTarget.value);
    formData.set("canceled", canceled ? "on" : "off");
    submit(formData);
  };

  return (
    <Form method="get">
      <div style={{ position: "relative" }}>
        <LoadingOverlay visible={transition.state === "submitting"} />
        <Stack justify="flex-start" align="stretch">
          <Group position="apart">
            <Switch
              label={t("showCanceled")}
              name="canceled"
              checked={canceled}
              onChange={handleCanceledChange}
            />
            <Group>
              <NativeSelect
                placeholder={t("amount")}
                data={["10", "20", "50"]}
                name="amount"
                value={amount}
                onChange={handleAmountChange}
              />
              <Pagination
                total={Math.ceil(totalReservations / amount)}
                page={page}
                onChange={handlePageChange}
              />
            </Group>
          </Group>
          {reservations.length === 0 ? (
            <Text>{t("noReservations")}</Text>
          ) : (
            <ReservationList
              reservations={reservations}
              showCanceled={canceled}
            />
          )}
        </Stack>
      </div>
    </Form>
  );
}
