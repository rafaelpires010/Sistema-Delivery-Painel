type FormatType =
  | "currency"
  | "kilometers"
  | "time"
  | "phone"
  | "cnpj"
  | "instagram"
  | "cep";

export function formatValue(value: number | string, type: FormatType): string {
  switch (type) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(value as number);
    case "kilometers":
      return `${value} km`;
    case "time":
      if (typeof value !== "number")
        throw new Error("Time value must be a number");
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
      }
      return `${value} min`;
    case "phone":
      if (typeof value !== "string")
        throw new Error("Phone value must be a string");
      return value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    case "cnpj":
      if (typeof value !== "string")
        throw new Error("CNPJ value must be a string");
      return value.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    case "instagram":
      if (typeof value !== "string")
        throw new Error("Instagram value must be a string");
      return value.startsWith("@") ? value : `@${value}`;
    default:
      throw new Error(`Unknown format type: ${type}`);
    case "cep":
      if (typeof value !== "string")
        throw new Error("CEP value must be a string");
      return value.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }
}
