import { Anchor, Text } from "@mantine/core";

export default function Copyright() {
  return (
    <Text size="xs" align="center">
      Copyright © {new Date().getFullYear()}{" "}
      <Anchor href="https://github.com/Maxtremee" target="_blank" size="xs" align="center">
        Maksymilian Zadka
      </Anchor>
    </Text>
  );
}
