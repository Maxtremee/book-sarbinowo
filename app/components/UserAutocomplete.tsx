import { FunctionComponent, useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Autocomplete, AutocompleteProps, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import type { LoaderData as GetUsersLoaderData } from "~/routes/getUsers";
import { LoaderQuarter } from "tabler-icons-react";

const UserAutocomplete: FunctionComponent<Omit<AutocompleteProps, "data">> = ({
  onChange,
  ...rest
}) => {
  const [searchStr, setSearchStr] = useState("");
  const [debounced] = useDebouncedValue(searchStr, 500);
  const fetcher = useFetcher<GetUsersLoaderData>();
  const names = fetcher.data?.users?.map(({ name }) => name) || [];

  const handleChange = (value: string) => {
    setSearchStr(value);
    onChange?.(value);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("name", searchStr);
    fetcher.submit(params, { action: "/getUsers" });
  }, [debounced]);

  return (
    <>
      <Autocomplete
        icon={fetcher.state === "submitting" && <LoaderQuarter />}
        {...rest}
        data={names}
        onChange={handleChange}
      />
      <TextInput
        label="Email"
        value={
          fetcher?.data?.users.find(({ name }) => rest.value === name)?.email
        }
      />
    </>
  );
};

export default UserAutocomplete;
