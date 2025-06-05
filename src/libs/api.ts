import { Campanha } from "@/types/Campanha";
import { Category } from "@/types/Category";
import { Cupom } from "@/types/Cupom";
import { Order } from "@/types/Order";
import { OrderStatus } from "@/types/Ordersatus";
import { Product } from "@/types/Product";
import { User, TenantUsers } from "@/types/User";
import axios from "axios";
import { getCookie } from "cookies-next";
import { Fatura } from "@/types/Fatura";
import { Message } from "@/types/whatsapp";

export const ApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const tenantSlug = getCookie("tenantSlug");

export const api = {
  login: async (email: string, senha: string) => {
    try {
      // Faz uma requisição para o backend enviando o email e a senha
      const response = await axios.post(`${ApiUrl}/admin/signin`, {
        email,
        senha,
      });

      // Verifica se a resposta do backend foi bem-sucedida e contém o token
      if (
        response.status === 200 &&
        response.data.token &&
        response.data.user
      ) {
        return response.data; // Retorna o token e os dados do usuário
      } else {
        return false; // Retorna falso caso a autenticação falhe
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { error: "Erro ao fazer login" }; // Retorna erro em caso de exceção
    }
  },
  authorizeToken: async (token: string): Promise<User | false> => {
    if (!token) return false;

    try {
      // Faz uma requisição ao backend para validar o token e buscar o usuário
      const response = await axios.post(
        `${ApiUrl}/authorize`,
        {}, // Corpo da requisição vazio se não for necessário
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Se o token for válido e os dados do usuário estiverem presentes na resposta
      if (response.status === 200 && response.data.user) {
        const user: User = response.data.user;
        return user; // Retorna o usuário
      } else {
        return false; // Retorna falso se o token for inválido
      }
    } catch (error) {
      console.error("Erro ao autorizar token:", error);
      return false;
    }
  },
  forgotPassword: async (email: string): Promise<{ error: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ error: "" });
      }, 1000);
    });
  },
  redefinePassword: async (
    password: string,
    token: string
  ): Promise<{ error: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ error: "" });
      }, 1000);
    });
  },

  //ORDERS
  getOrders: async (token: string): Promise<Order[]> => {
    try {
      const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  },
  changeOrderStats: async (
    token: string,
    id: number,
    newStatus: OrderStatus
  ) => {
    try {
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/order/status/${id}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Verifica se a resposta foi bem-sucedida
      if (response.status === 200) {
        console.log("Status do pedido atualizado com sucesso");
        return true;
      } else {
        console.error(
          "Erro ao atualizar o status do pedido:",
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.error(
        "Erro na requisição para atualizar o status do pedido:",
        error
      );
      return false;
    }
  },

  //CATEGORIAS
  getCategories: async (token: string): Promise<Category[]> => {
    try {
      const response = await fetch(`${ApiUrl}/admin/${tenantSlug}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar categorias");
      return await response.json();
    } catch (error) {
      console.error("Erro na API:", error);
      return [];
    }
  },
  CreateCategory: async (token: string, form: FormData) => {
    try {
      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/categories`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao criar categoria:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  updateCategory: async (token: string, form: FormData) => {
    try {
      // Extrair o ID do produto do FormData
      const categoryId = form.get("id"); // Substitua 'id' pelo nome da chave usada no FormData para o ID

      if (!categoryId) {
        throw new Error("ID do produto não encontrado no FormData");
      }

      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      // Fazer a requisição PUT para atualizar o produto
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/categories/${categoryId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar produto:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  deleteCategory: async (token: string, id: number): Promise<boolean> => {
    try {
      // Faça a requisição DELETE para a API
      const response = await axios.delete(
        `${ApiUrl}/admin/${tenantSlug}/categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Verifique o status da resposta
      if (response.status === 204) {
        console.log(`Categoria com ID ${id} deletado com sucesso.`);
        return true;
      } else {
        console.error(
          `Erro ao deletar categoria com ID ${id}: Status ${response.status}`
        );
        return false;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao deletar categoria:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      return false;
    }
  },
  toggleCategoryStatus: async (token: string, categoryId: number) => {
    const response = await axios.put(
      `${ApiUrl}/admin/${tenantSlug}/categories/${categoryId}/toggle-status`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  //PRODUTOS
  getProducts: async (token: string): Promise<Product[]> => {
    try {
      const response = await fetch(`${ApiUrl}/admin/${tenantSlug}/products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar produtos");
      return await response.json();
    } catch (error) {
      console.error("Erro na API:", error);
      return [];
    }
  },
  deleteProduct: async (token: string, id: number): Promise<boolean> => {
    try {
      // Faça a requisição DELETE para a API
      const response = await axios.delete(
        `${ApiUrl}/admin/${tenantSlug}/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Verifique o status da resposta
      if (response.status === 200) {
        console.log(`Produto com ID ${id} deletado com sucesso.`);
        return true;
      } else {
        console.error(
          `Erro ao deletar produto com ID ${id}: Status ${response.status}`
        );
        return false;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao deletar produto:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      return false;
    }
  },
  createProduct: async (token: string, form: FormData) => {
    try {
      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/products`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao criar produto:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  updateProduct: async (token: string, form: FormData) => {
    try {
      // Extrair o ID do produto do FormData
      const productId = form.get("id"); // Substitua 'id' pelo nome da chave usada no FormData para o ID

      if (!productId) {
        throw new Error("ID do produto não encontrado no FormData");
      }

      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      // Fazer a requisição PUT para atualizar o produto
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/products/${productId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar produto:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  toggleProductStatus: async (token: string, productId: number) => {
    const response = await axios.put(
      `${ApiUrl}/admin/${tenantSlug}/products/${productId}/toggle-status`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  //TENANT
  updateOpenClose: async (token: string) => {
    try {
      // Realiza a requisição POST para alternar o status de "aberto" ou "fechado"
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/toggleOpenClose`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Exibe uma mensagem de sucesso com o status atualizado
      const status = response.data.tenant.isOpen ? "Aberto" : "Fechado";
      // Retorna os dados do tenant atualizados
      return response.data.tenant;
    } catch (error) {
      // Em caso de erro, exibe uma mensagem apropriada
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao tentar atualizar o status da loja.");
    }
  },
  getOpenClose: async (token: string) => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/toggleOpenClose`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );
      // Verifica a resposta completa
      console.log("Response data:", response.data.isOpen);

      // Retorna o status de abertura da loja (true ou false) conforme a resposta da API
      return response.data.isOpen;
    } catch (error) {
      console.error("Erro ao buscar o status da loja:", error);
      return null; // Retorna null em caso de erro
    }
  },
  getTenants: async (token: string) => {
    try {
      const response = await axios.get(`${ApiUrl}/admin/user/tenants`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
        },
      });

      // Retorna o status de abertura da loja (true ou false) conforme a resposta da API
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar os tenants:", error);
      return null; // Retorna null em caso de erro
    }
  },
  getTenant: async (token: string) => {
    try {
      const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar os tenants:", error);
      return null; // Retorna null em caso de erro
    }
  },
  //edit layout
  updateLayoutTenant: async (token: string, form: FormData) => {
    try {
      // Extrair o ID do produto do FormData
      const tenantId = form.get("id"); // Substitua 'id' pelo nome da chave usada no FormData para o ID

      if (!tenantId) {
        throw new Error("ID do Tenant não encontrado no FormData");
      }

      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      // Fazer a requisição PUT para atualizar o produto
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/layout/${tenantId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar produto:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  //edit informações
  updateLayoutInfo: async (token: string, form: FormData) => {
    try {
      // Transformar o FormData em um objeto JSON
      const jsonData: { [key: string]: any } = {};
      form.forEach((value, key) => {
        jsonData[key] = value;
      });

      // Exibir o objeto JSON no console (opcional)
      console.log("Dados JSON:", jsonData);

      // Extrair o ID do tenant do JSON
      const tenantId = jsonData.id; // Substitua 'id' pela chave correta no FormData
      if (!tenantId) {
        throw new Error("ID do Tenant não encontrado nos dados JSON");
      }

      // Fazer a requisição PUT para atualizar o tenant
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/infos/${tenantId}`,
        jsonData, // Envia o JSON ao invés do FormData
        {
          headers: {
            "Content-Type": "application/json", // Muda o tipo de conteúdo para JSON
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar informações do tenant:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  //edit Zonas
  updateLayoutZones: async (token: string, form: FormData) => {
    try {
      // Transformar o FormData em um objeto JSON e converter valores para números quando necessário
      const jsonData: { [key: string]: any } = {};
      form.forEach((value, key) => {
        // Tentar converter o valor para número, mantendo string se não for numérico
        const numberValue = parseFloat(value as string);
        jsonData[key] = isNaN(numberValue) ? value : numberValue;
      });

      // Exibir o objeto JSON no console (opcional)
      console.log("Dados JSON processados:", jsonData);

      // Extrair o ID do tenant do JSON
      const tenantId = jsonData.id; // Substitua 'id' pela chave correta no FormData
      if (!tenantId) {
        throw new Error("ID do Tenant não encontrado nos dados JSON");
      }

      // Fazer a requisição PUT para atualizar o tenant
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/zones/${tenantId}`,
        jsonData, // Envia o JSON com os valores numéricos
        {
          headers: {
            "Content-Type": "application/json", // Muda o tipo de conteúdo para JSON
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar informações de entrega do tenant:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  //edit Funcionamento
  updateLayoutFunc: async (token: string, form: FormData) => {
    try {
      // Transformar o FormData em um objeto JSON
      const jsonData: { [key: string]: any } = {};
      form.forEach((value, key) => {
        jsonData[key] = value;
      });

      // Exibir o objeto JSON no console (opcional)
      console.log("Dados JSON:", jsonData);

      // Extrair o ID do tenant do JSON
      const tenantId = jsonData.id; // Substitua 'id' pela chave correta no FormData
      if (!tenantId) {
        throw new Error("ID do Tenant não encontrado nos dados JSON");
      }

      // Fazer a requisição PUT para atualizar o tenant
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/funcionamento/${tenantId}`,
        jsonData, // Envia o JSON ao invés do FormData
        {
          headers: {
            "Content-Type": "application/json", // Muda o tipo de conteúdo para JSON
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar informações do tenant:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  //edit Endereço
  updateLayoutEndereco: async (token: string, form: FormData) => {
    try {
      // Transformar o FormData em um objeto JSON
      const jsonData: { [key: string]: any } = {};
      form.forEach((value, key) => {
        jsonData[key] = value;
      });

      // Exibir o objeto JSON no console (opcional)
      console.log("Dados JSON:", jsonData);

      // Extrair o ID do tenant do JSON
      const tenantId = jsonData.id; // Substitua 'id' pela chave correta no FormData
      if (!tenantId) {
        throw new Error("ID do Tenant não encontrado nos dados JSON");
      }

      // Fazer a requisição PUT para atualizar o tenant
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/endereco/${tenantId}`,
        jsonData, // Envia o JSON ao invés do FormData
        {
          headers: {
            "Content-Type": "application/json", // Muda o tipo de conteúdo para JSON
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao atualizar informações do tenant:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },

  //BANNERS
  getBanners: async (token: string) => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/banners`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Retorna o status de abertura da loja (true ou false) conforme a resposta da API
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar por bunners:", error);
      return null; // Retorna null em caso de erro
    }
  },
  addBanner: async (token: string, form: FormData) => {
    try {
      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/Banners`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao adcionar Banner:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },
  deleteBanner: async (token: string, id: number): Promise<boolean> => {
    try {
      // Faça a requisição DELETE para a API
      const response = await axios.delete(
        `${ApiUrl}/admin/${tenantSlug}/banner/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );

      // Verifique o status da resposta
      if (response.status === 200) {
        console.log(`Banner com ID ${id} deletado com sucesso.`);
        return true;
      } else {
        console.error(
          `Erro ao deletar Banner com ID ${id}: Status ${response.status}`
        );
        return false;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao deletar Banner:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      return false;
    }
  },

  //Cupons
  getCupons: async (token: string): Promise<Cupom[]> => {
    try {
      console.log(`Fetching cupons for tenant: ${tenantSlug}`); // Log para depuração
      const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}/cupons`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Cupons:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  },
  createCupom: async (token: string, form: FormData) => {
    try {
      // Exibir dados do FormData no console
      form.forEach((value, key) => {
        console.log(`FormData - ${key}: ${value}`);
      });

      // Converte os valores numéricos e formata as datas
      const validade = form.get("validade");
      const data = {
        codigo: form.get("codigo") as string,
        desconto: Number(form.get("desconto")),
        tipoDesconto: form.get("tipoDesconto") as "PERCENTUAL" | "VALOR",
        dataInicio: form.get("dataInicio")
          ? new Date(form.get("dataInicio") as string).toISOString()
          : new Date().toISOString(),
        validade: validade ? new Date(validade as string).toISOString() : null,
        limiteUso: Number(form.get("limiteUso")) || 0,
        valorMinimo: Number(form.get("valorMinimo")) || 0,
        descricao: (form.get("descricao") as string) || "",
        ativo: true,
      };

      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/cupons`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao criar cupom:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      throw error;
    }
  },

  toggleCupomStatus: async (token: string, cupomId: number) => {
    try {
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/cupons/${cupomId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao alterar status do cupom:", error);
      throw error;
    }
  },
  updateCupom: async (token: string, form: FormData) => {
    try {
      const cupomId = form.get("id");
      if (!cupomId) throw new Error("ID do cupom não encontrado");

      const data = {
        id: Number(cupomId),
        codigo: form.get("codigo") as string,
        desconto: Number(form.get("desconto")),
        tipoDesconto: form.get("tipoDesconto") as "PERCENTUAL" | "VALOR",
        dataInicio: form.get("dataInicio")
          ? new Date(form.get("dataInicio") as string).toISOString()
          : new Date().toISOString(),
        validade: form.get("validade")
          ? new Date(form.get("validade") as string).toISOString()
          : null,
        limiteUso: Number(form.get("limiteUso")) || 0,
        valorMinimo: Number(form.get("valorMinimo")) || 0,
        descricao: (form.get("descricao") as string) || "",
        ativo: true,
      };

      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/cupons/${cupomId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.code === "P2002") {
          throw new Error("Já existe um cupom com este código");
        }
        console.error(
          "Erro ao atualizar cupom:",
          error.response?.data || error.message
        );
      }
      throw error;
    }
  },

  deleteCupom: async (token: string, id: number): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `${ApiUrl}/admin/${tenantSlug}/cupons/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(`Cupom ${id} deletado com sucesso`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao deletar cupom:", error);
      throw error;
    }
  },

  //Campanhas
  getCampanhas: async (token: string): Promise<Campanha[]> => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/campanhas`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Campanhas:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  },

  deleteCampanha: async (token: string, id: number): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `${ApiUrl}/admin/${tenantSlug}/campanhas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log(`Campanha com ID ${id} deletada com sucesso.`);
        return true;
      } else {
        console.error(
          `Erro ao deletar campanha com ID ${id}: Status ${response.status}`
        );
        return false;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro ao deletar campanha:",
          error.response?.data || error.message
        );
      } else {
        console.error("Erro inesperado:", error);
      }
      return false;
    }
  },
  createCampanha: async (token: string, data: any) => {
    try {
      const formData = new FormData();

      // Adiciona os dados básicos
      formData.append("nome", data.nome);
      formData.append("descricao", data.descricao);
      formData.append("ativo", data.ativo);
      if (data.cupomId) {
        formData.append("cupomId", data.cupomId);
      }

      // Adiciona a imagem se existir
      if (data.img) {
        formData.append("img", data.img);
      }

      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/campanhas`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      throw error;
    }
  },
  updateCampanha: async (token: string, data: any) => {
    try {
      // Criar objeto com os dados
      const jsonData: {
        nome: string;
        descricao: string;
        ativo: boolean;
        id: number;
        cupomId?: number;
      } = {
        nome: data.nome,
        descricao: data.descricao,
        ativo: Boolean(data.ativo),
        id: data.id,
      };

      // Adiciona o cupomId se existir
      if (data.cupomId) {
        jsonData.cupomId = parseInt(data.cupomId);
      }

      // Se tiver imagem, usa FormData
      if (data.img instanceof File) {
        const formData = new FormData();
        formData.append("img", data.img);

        // Primeiro envia a imagem
        await axios.put(
          `${ApiUrl}/admin/${tenantSlug}/campanhas/${data.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Depois envia os dados como JSON
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/campanhas/${data.id}`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao atualizar campanha:", error.response?.data);
      }
      throw error;
    }
  },

  //Clientes
  getClientes: async (token: string) => {
    const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  //Pagamentos

  getMetodosPagamento: async (token: string) => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/formas-pagamento`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("API Response:", response); // Debug
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar métodos de pagamento:", error);
      throw error;
    }
  },

  createMetodoPagamento: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/formas-pagamento`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar método de pagamento:", error);
      throw error;
    }
  },

  updateMetodoPagamento: async (token: string, id: number, data: any) => {
    try {
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/formas-pagamento/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar método de pagamento:", error);
      throw error;
    }
  },

  deleteMetodoPagamento: async (token: string, id: number) => {
    try {
      const response = await axios.delete(
        `${ApiUrl}/admin/${tenantSlug}/formas-pagamento/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar método de pagamento:", error);
      throw error;
    }
  },
  toggleMetodoPagamentoStatus: async (token: string, id: number) => {
    try {
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/formas-pagamento/${id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao alterar status do método de pagamento:", error);
      throw error;
    }
  },

  //Assinaturas

  getAssinaturaStatus: async (token: string) => {
    // Dados fictícios
    return {
      ativo: false, // sistema bloqueado
      dataVencimento: "2024-02-15",
      diasRestantes: 0,
      valorMensal: 99.9,
      plano: "Plano Premium",
    };
  },

  getFaturas: async (token: string): Promise<Fatura[]> => {
    return [
      {
        id: 1,
        valor: 99.9,
        dataVencimento: "2024-02-15",
        dataPagamento: null,
        status: "vencido" as const,
        linkBoleto: "https://exemplo.com/boleto/1",
      },
      // ... outros objetos com status: "pendente" as const ou "pago" as const
    ];
  },

  liberarAcessoTemporario: async (token: string) => {
    // Simula delay da API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simula resposta de sucesso
    return {
      success: true,
      message: "Sistema liberado por 3 dias",
      validoAte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  //Whatsapp

  getWhatsAppMessages: async (token: string): Promise<Message[]> => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/whatsapp/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      return [];
    }
  },

  sendWhatsAppCampaign: async (token: string, formData: FormData) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/whatsapp/campaigns`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar campanha:", error);
      throw error;
    }
  },

  //users
  getUsers: async (token: string): Promise<TenantUsers[]> => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/usersTenant`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro na requisição:", error.response?.data);
      } else {
        console.error("Erro inesperado:", error);
      }
      return [];
    }
  },

  toggleUserStatus: async (
    token: string,
    id: number,
    data: { tenantIds: number[] }
  ) => {
    const response = await axios.put(
      `${ApiUrl}/admin/users/${id}/toggle-status`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
  createUser: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/users`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro na requisição:", error.response?.data);
      }
      throw error;
    }
  },

  getUserById: async (token: string, userId: number) => {
    const response = await axios.get(`${ApiUrl}/admin/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getTenantsByLoggedUser: async (token: string) => {
    const response = await axios.get(`${ApiUrl}/admin/user/tenants`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getRoles: async (token: string) => {
    const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getClaims: async (token: string) => {
    const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}/claims`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  //vendas
  aceitaVenda: async (token: string, pedidoId: number) => {
    const response = await axios.put(
      `${ApiUrl}/admin/${tenantSlug}/vendas/${pedidoId}/confirmar`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  getVendas: async (
    token: string,
    dataInicial?: string,
    dataFinal?: string,
    metodosPagamento?: number[],
    status?: string[]
  ) => {
    try {
      const payload = {
        dataInicial,
        dataFinal,
        formasPagamento: metodosPagamento || [],
        status: status || [],
      };

      console.log("Payload da requisição:", payload);
      const url = `${ApiUrl}/admin/${tenantSlug}/relatorios/vendas?dataInicial=${payload.dataInicial}&dataFinal=${payload.dataInicial}&formasPagamento=${payload.formasPagamento}&status=${payload.status}`;
      console.log("URL da requisição:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Retornar apenas os dados da resposta
      return response.data;
    } catch (error) {
      console.error("Erro na API:", error);
      throw error;
    }
  },

  cancelarVenda: async (token: string, vendaId: number) => {
    try {
      const response = await axios.put(
        `${ApiUrl}/admin/${tenantSlug}/vendas/${vendaId}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);
      throw error;
    }
  },

  getRelatorioProdutos: async (
    token: string,
    dataInicial?: string,
    dataFinal?: string,
    categoriaId?: number[],
    produtoId?: number[]
  ) => {
    try {
      const response = await axios.get(
        `${ApiUrl}/admin/${tenantSlug}/relatorios/produtos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&categorias=${categoriaId}&produtos=${produtoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar relatório de produtos:", error);
      throw error;
    }
  },

  //PDVS
  getPDVs: async (token: string) => {
    try {
      const response = await axios.get(`${ApiUrl}/admin/${tenantSlug}/pdvs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar PDVs:", error);
      throw error;
    }
  },

  abrirCaixa: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/caixa/abrir`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao abrir caixa");
    }
  },

  getCaixa: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/caixa/atual`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao buscar caixa");
    }
  },
  registrarVenda: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/registrar-order`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  fecharCaixa: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/caixa/fechar`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      throw error;
    }
  },
  trocarOperador: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/trocar-operador`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao trocar operador:", error);
      throw error;
    }
  },
  cancelarVendaPdv: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/cancelar-venda`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);
      throw error;
    }
  },

  cancelarUltimaVendaPdv: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/cancelar-ultima-venda`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar última venda:", error);
      throw error;
    }
  },
  reimprimirCupom: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/reimprimir-cupom`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao reimprimir cupom:", error);
      throw error;
    }
  },
  reimprimirUltimoCupom: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/reimprimir-ultimo-cupom`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao reimprimir último cupom:", error);
      throw error;
    }
  },
  sangria: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/caixa/sangria`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer sangria:", error);
      throw error;
    }
  },
  suprimento: async (token: string, data: any) => {
    try {
      const response = await axios.post(
        `${ApiUrl}/admin/${tenantSlug}/pdv/caixa/suprimento`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer suprimento:", error);
      throw error;
    }
  },
};
