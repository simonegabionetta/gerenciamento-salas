const request = require("supertest");
const { expect } = require("chai");
const app = require("../../src/app");
const authData = require("./fixtures/auth.json");
const requestData = require("./fixtures/requests.json");
const responseData = require("./fixtures/responses.json");

describe("Testes de Cancelamento de Agendamento de Salas", () => {
  let token;
  let agendamentoId;

  // Hook para autenticação antes dos testes
  before(async () => {
    const authResponse = await request(app)
      .post("/auth/login")
      .send(authData.usuarioValido);

    token = authResponse.body.token;
  });

  // Criar um agendamento antes de cada teste
  beforeEach(async () => {
    const response = await request(app)
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(requestData.agendamentoParaCancelar);

    agendamentoId = response.body.id;
  });

  describe("DELETE /bookings/{id}", () => {
    it("deve cancelar agendamento com sucesso", async () => {
      const response = await request(app)
        .delete(`/bookings/${agendamentoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).to.deep.equal(responseData.sucessoCancelamento);

      // Verificar se o agendamento foi realmente cancelado tentando cancelar novamente
      const segundaTentativa = await request(app)
        .delete(`/bookings/${agendamentoId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);

      expect(segundaTentativa.body).to.deep.equal(
        responseData.erroAgendamentoNaoEncontrado
      );
    });

    it("deve falhar ao tentar cancelar agendamento inexistente", async () => {
      const idInexistente = 999999;
      const response = await request(app)
        .delete(`/bookings/${idInexistente}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);

      expect(response.body).to.deep.equal(
        responseData.erroAgendamentoNaoEncontrado
      );
    });

    it("deve falhar ao tentar cancelar sem autenticação", async () => {
      const response = await request(app)
        .delete(`/bookings/${agendamentoId}`)
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroAutorizacao);
    });

    it("deve falhar ao tentar cancelar com token inválido", async () => {
      const response = await request(app)
        .delete(`/bookings/${agendamentoId}`)
        .set("Authorization", "Bearer token_invalido")
        .expect(400);

      expect(response.body).to.deep.equal(responseData.erroAutorizacao);
    });
  });
});
