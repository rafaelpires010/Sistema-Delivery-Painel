export const dateFormat = (date: string | Date) => {
  try {
    // Verificar se a data é válida
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Data inválida");
    }

    // Formatar a data para 'pt-BR'
    return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
  } catch (error) {
    console.error("Erro ao formatar a data:", error);
    return "Data inválida"; // Ou uma string padrão que você prefira
  }
};

export const dateTimeFormat = (date: string | Date) => {
  try {
    // Verificar se a data é válida
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Data inválida");
    }

    // Formatar a data e a hora para 'pt-BR'
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsedDate);
  } catch (error) {
    console.error("Erro ao formatar a data:", error);
    return "Data inválida"; // Ou uma string padrão que você prefira
  }
};
