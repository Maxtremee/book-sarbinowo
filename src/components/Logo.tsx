import { Text } from "@chakra-ui/react"

export default function Logo() {
  return (
    <div style={{ width: "fit-content" }}>
      <Text
        as="h1"
        bgGradient="linear(45deg, blue, aquamarine)"
        bgClip="text"
        fontSize="4xl"
        fontWeight="extrabold"
        textAlign="center"
        lineHeight="shorter"
      >
        Book
        <br />
        Sarbinowo
      </Text>
    </div>
  )
}
