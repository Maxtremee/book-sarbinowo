import { extendTheme, type ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
  initialColorMode: "system",
}

const theme = extendTheme({
  config,
  colors: {
    app: {
      50: "#dbf7ff",
      100: "#b4e7f8",
      200: "#8bd9f1",
      300: "#5fcee9",
      400: "#37c5e1",
      500: "#1ea1c8",
      600: "#0d729d",
      700: "#004971",
      800: "#002746",
      900: "#000c1b",
    },
  },
})

export default theme
