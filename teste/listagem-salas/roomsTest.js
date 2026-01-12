const request = require("supertest");
const { expect } = require("chai");
const app = require("../../src/app");
const authData = require("./fixtures/auth.json");
const responseData = require("./fixtures/responses.json");

describe("Testes de Listagem de Salas", () => {
  let token;

  // Hook para autenticação antes dos testes
  before(async () => {
    const authResponse = await request(app)
      .post("/auth/login")
      .send(authData.usuarioValido);

    token = authResponse.body.token;
  });

  describe("GET /rooms", () => {
    it("deve listar todas as salas com autenticação válida", async () => {
      const response = await request(app)
        .get("/rooms")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).to.be.an("array");
      response.body.forEach((sala) => {
        expect(sala).to.have.property("id");
        expect(sala).to.have.property("nome");
        expect(sala).to.have.property("descricao");
      });
    });

    it("deve retornar array vazio quando não existem salas cadastradas", async () => {
      // Assumindo que o banco de dados está vazio
      const response = await request(app)
        .get("/rooms")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).to.deep.equal(responseData.listaSalasVazia);
    });

    it("deve falhar ao listar salas sem token de autenticação", async () => {
      const response = await request(app).get("/rooms").expect(400);

      expect(response.body).to.deep.equal(responseData.erroAutorizacao);
    });

    it("deve falhar ao listar salas com token inválido", async () => {
      const response = await request(app)
        .get("/rooms")
        .set("Authorization", "Bearer token_invalido")
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroAutorizacao);
    });
  });
});
