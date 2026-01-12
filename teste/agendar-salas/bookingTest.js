const request = require("supertest");
const { expect } = require("chai");
const app = require("../../src/app");
const authData = require("./fixtures/auth.json");
const requestData = require("./fixtures/requests.json");
const responseData = require("./fixtures/responses.json");

describe("Testes de Agendamento de Salas", () => {
  let token;

  // Hook para autenticação antes dos testes
  before(async () => {
    const authResponse = await request(app)
      .post("/auth/login")
      .send(authData.usuarioValido);

    token = authResponse.body.token;
  });

  describe("POST /bookings", () => {
    it("deve realizar agendamento com sucesso quando sala estiver disponível", async () => {
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData.agendamentoValido)
        .expect(200);

      expect(response.body).to.deep.equal(responseData.sucessoAgendamento);
    });

    it("deve falhar ao tentar agendar sala em horário já reservado", async () => {
      // Primeiro agendamento
      await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData.agendamentoValido);

      // Tentativa de agendamento conflitante
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData.agendamentoConflito)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroSalaIndisponivel);
    });

    it("deve falhar ao tentar agendar sem informar o nome da reunião", async () => {
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData.agendamentoSemNome)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroDadosInvalidos);
    });

    it("deve falhar ao tentar agendar sem informar a sala", async () => {
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData.agendamentoSemSala)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroDadosInvalidos);
    });

    it("deve falhar ao tentar agendar com horário de fim anterior ao início", async () => {
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(requestData.agendamentoDataInvalida)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroDadosInvalidos);
    });

    it("deve falhar ao tentar agendar sem autenticação", async () => {
      const response = await request(app)
        .post("/bookings")
        .send(requestData.agendamentoValido)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroAutorizacao);
    });

    it("deve falhar ao tentar agendar com token inválido", async () => {
      const response = await request(app)
        .post("/bookings")
        .set("Authorization", "Bearer token_invalido")
        .send(requestData.agendamentoValido)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroAutorizacao);
    });
  });
});
