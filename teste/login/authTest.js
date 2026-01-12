const request = require("supertest");
const { expect } = require("chai");
const app = require("../../src/app");
const requestData = require("./fixtures/requests.json");
const responseData = require("./fixtures/responses.json");

describe("Testes de Autenticação", () => {
  describe("POST /auth/login", () => {
    it("deve autenticar com credenciais válidas", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send(requestData.loginValido)
        .expect(200);

      expect(response.body).to.have.property("token");
      expect(response.body.token).to.be.a("string");
    });

    it("deve falhar com credenciais inválidas", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send(requestData.loginInvalido)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.loginFalha);
    });

    it("deve falhar quando a senha não é fornecida", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send(requestData.loginSemSenha)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.loginInvalido);
    });

    it("deve falhar quando o login não é fornecido", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send(requestData.loginSemUsuario)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.loginInvalido);
    });
  });
});
