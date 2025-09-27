import { describe, it, expect } from "vitest";
import request from "supertest";
import server from "../../../server";

describe("GET /api/v1/courses", () => {
	let response;
	let success;
	it("should return all courses", async () => {
		response = await request(server).get(`/api/v1/courses`);
		success = await response.body.success;
		expect(success,true);
	});
	
	it("should return first course", async () => {
		if (response.body.data) {
			const courseOne = response.body.data[0].code;
			const response2 = await request(server).get(`/api/v1/courses/search?search=${courseOne}`).expect(200);
			expect(response2.body).toHaveProperty("data");
		}
	});

	it("should search by name", async () => {
		if (response.body.data) {
			const courseOne = response.body.data[0].name;
			const response2 = await request(server).get(`/api/v1/courses/code?code=${courseOne}`).expect(200);
			expect(response2.body).toHaveProperty("data");
		}
	});

	it("should search by course code", async () => {
		if (response.body.data) {
			const courseOne = response.body.data[0].code;
			const response2 = await request(server).get(`/api/v1/courses/code?code=${courseOne}`).expect(200);
			expect(response2.body).toHaveProperty("data");
		}
	});
});