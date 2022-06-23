export default function showAvailability(fetcher: any): {
  message: string;
  color: string;
} {
  switch (fetcher.state) {
    case "submitting":
      return {
        message: "checkingAvailability",
        color: "yellow",
      };
    case "idle":
      return fetcher.data?.isAvailable
        ? { message: "apartmentAvailable", color: "green" }
        : {
            message: "apartmentOccupied",
            color: "red",
          };
    default:
      return { message: "", color: "" };
  }
}
