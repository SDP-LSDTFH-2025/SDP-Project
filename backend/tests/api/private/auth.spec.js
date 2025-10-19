import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe("GET /api/v1/auth/me", () => {
	it("should fail testing api without real token", async () => {
		const response = await request(server).get(`/api/v1/auth/me`);
		expect(response.body).toHaveProperty("success",false);
        expect(response.body).toHaveProperty("error","Access denied. No token provided.");
	});
});

describe("POST /api/v1/auth/", () => {
	it("should fail testing api without real token", async () => {
		const response = await request(server).post(`/api/v1/auth/logIn`).send({password:"fakepassword",email:"fakepassword"});
		expect(response.body).toHaveProperty("response","invalid email syntax");
	});

	it("should fail testing api without real token", async () => {
		const response = await request(server).post(`/api/v1/auth/signIn`).send({password:"fakepassword"});
		expect(response.body).toHaveProperty("response","Insufficient info provided by client");
	});

	it("should fail testing api without real token", async () => {
		const response = await request(server).post(`/api/v1/auth/signIn`).send({email:"fakepassword"}).expect(422);
	});
});