import type { ButtonProps } from "@mantine/core";
import { Button } from "@mantine/core";
import type { FunctionComponent } from "react";
import { Link } from "@remix-run/react";

const NavbarLink: FunctionComponent<ButtonProps<typeof Link>> = (props) => {
  return (
    <Button
      {...props}
      component={Link}
      fullWidth
      styles={() => ({
        root: {
          height: "4rem",
          borderRadius: "0px",
        },
        inner: {
          justifyContent: "flex-start",
        },
      })}
      variant="light"
      type="button"
    />
  );
};

export default NavbarLink;
