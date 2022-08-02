import type { FunctionComponent, SetStateAction} from "react";
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import type { AutocompleteItem} from "@mantine/core";
import { Autocomplete, TextInput } from "@mantine/core";
import { randomId, useDebouncedValue } from "@mantine/hooks";
import type { LoaderData as GetUsersLoaderData } from "~/routes/api/previousGuests";
import { LoaderQuarter } from "tabler-icons-react";
import { useTranslation } from "react-i18next";
import type { UseFormReturnType } from "@mantine/form/lib/use-form";
import type { NewReservationFormValues } from "~/routes/reservations/new";

type UserAutocompleteProps = {
  form: UseFormReturnType<NewReservationFormValues>;
  index: number;
};

const UserAutocomplete: FunctionComponent<UserAutocompleteProps> = ({
  form,
  index,
}) => {
  const { t } = useTranslation();
  const [searchStr, setSearchStr] = useState("");
  const [debounced] = useDebouncedValue(searchStr, 500);
  const {
    data,
    submit,
    state: fetcherState,
  } = useFetcher<GetUsersLoaderData>();
  const names = data?.guests?.map(({ name }) => name) || [];
  const nameInputProps = form.getListInputProps("guests", index, "name");

  const handleNameChange = (value: SetStateAction<string>) => {
    setSearchStr(value.toString());
    nameInputProps.onChange(value.toString());
  };

  const handleChooseName = (item: AutocompleteItem) => {
    const email = data?.guests?.find(({ name }) => name === item.value)?.email;
    form.setListItem("guests", index, {
      name: item.value,
      email: email || "",
      key: randomId(),
    });
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("name", searchStr);
    submit(params, { action: "/api/previousGuests" });
  }, [debounced]);

  return (
    <>
      <Autocomplete
        {...nameInputProps}
        required
        label={t("firstName")}
        placeholder={t("guestNamePlaceholder")}
        onChange={handleNameChange}
        onItemSubmit={handleChooseName}
        data={names}
        rightSection={fetcherState === "submitting" && <LoaderQuarter />}
      />
      <TextInput
        {...form.getListInputProps("guests", index, "email")}
        label={t("email")}
        type="email"
        placeholder="mail@mail.com"
      />
    </>
  );
};

export default UserAutocomplete;
