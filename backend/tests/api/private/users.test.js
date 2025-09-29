import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import server from "../../../server"; // Adjust path to your app

describe("User Get API Endpoints", () => {
	let response;
	it("should return all users", async () => {
		response = await request(server).get(`/api/v1/users`).expect(200);
		expect(response.body).toHaveProperty("data");
	});

	it("should return first users", async () => {
       const userOne = response.body.data[0].id;

        const response2 = await request(server).get(`/api/v1/users/${userOne}`).expect(200);
        expect(response2.body).toHaveProperty("data");
	});
});
