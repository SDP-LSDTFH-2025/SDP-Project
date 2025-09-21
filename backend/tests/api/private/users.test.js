import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import server from "../../../server"; // Adjust path to your app

describe("User Get API Endpoints", () => {
	it("should return all users", async () => {
		const response = await request(server).get(`/api/v1/users`).expect(200);
		expect(response.body).toHaveProperty("data");
	});

	it("should return first users", async () => {
		const response = await request(server).get(`/api/v1/users`).expect(200);
		expect(response.body).toHaveProperty("data");

        const userOne = response.body.data[0].id;

        const response2 = await request(server).get(`/api/v1/users/${userOne}`).expect(200);
        expect(response2.body).toHaveProperty("data");
	});
});
