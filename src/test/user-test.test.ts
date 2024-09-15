import supertest from "supertest";
import { app } from "../index";
import { prismaClient } from "../application/database/database";
import { UserService } from "../application/services/user-services";
import { JWTToken } from "../application/utils/jwt";

const request = supertest(app);

describe("User API", () => {
  afterAll(async () => {
    // Tutup koneksi Prisma setelah semua test
    await prismaClient.user.deleteMany();
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const res = await request.post("/api/users/register").send({
        username: "testuser2",
        password: "password123",
        name: "Test User",
      });

      expect(res.status).toBe(201);
    });

    it("should not allow duplicate usernames", async () => {
      // Register user pertama
      await request
        .post("/api/users/register")
        .send({ username: "duplicate", password: "pass1", name: "User 1" });

      // Coba register dengan username yang sama
      const res = await request
        .post("/api/users/register")
        .send({ username: "duplicate", password: "pass2", name: "User 2" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      // console.log(res)
    });

    it("should validate input data", async () => {
      const res = await request
        .post("/api/users/register")
        .send({ username: "", password: "", name: "A" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      // console.log(res)
    });
  });

  describe("POST /api/users/login", () => {
    //! should login as user
    it("should login as user", async () => {
      const newuser = await request.post("/api/users/register").send({
        username: "should login as user",
        password: "password123",
        name: "should login as user",
      });
      console.log(newuser.body);
      const res = await request.post("/api/users/login").send({
        username: "should login as user",
        password: "password123",
      });
      expect(res.status).toBe(200);
      // console.log(res.body);
    });

    //! should has acces token
    it("should has acces token", async () => {
      const newUser = await request.post("/api/users/register").send({
        username: "test user has acces token",
        password: "password123",
        name: "test user has acces token",
      });
      const res = await request.post("/api/users/login").send({
        username: "test user has acces token",
        password: "password123",
      });
      // console.log(res.body);
      expect(res.body.data).toHaveProperty("accessToken");
    });
    //! should not login as user
    it("should not login as user", async () => {
      const res = await request.post("/api/users/login").send({
        username: "testnotusers",
        password: "password123",
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      // console.log(res.body);
    });
  });
  describe("GET /api/users/me", () => {
    it("should return 401 if no access token is provided", async () => {
      const res = await request.get("/api/users/me");

      expect(res.status).toBe(401);
      //   expect(res.body.message).toBe("Invalid Token");
    });

    it("should return 401 if access token is invalid", async () => {
      // Simulasi JWTToken.verifyAccessToken gagal (token tidak valid)
      //   (JWTToken.verifyAccessToken as jest.Mock).mockImplementation(() => {
      //     throw new Error("Invalid Token");
      //   });

      const res = await request
        .get("/api/users/me")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
      //   expect(res.body.message).toBe("Invalid Token");
    });

    it("should return user data if access token is valid", async () => {
      const newUser = await request.post("/api/users/register").send({
        username: "test user has acces token",
        password: "password123",
        name: "test user has acces token",
      });
      const responseLogin = await request.post("/api/users/login").send({
        username: "test user has acces token",
        password: "password123",
      });
      const token = responseLogin.body.data.accessToken;
    //   console.log(`token ${JSON.stringify(token)}`);
      // console.log(res.body);
      //   expect(res.body.data).toHaveProperty("accessToken");
      // Simulasi UserService.getUserById mengembalikan user yang valid
      //   const mockUser = { id: "userId123", name: "John Doe" };
      //   (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);
    //   console.log(`status code ${JSON.stringify(res.body)}`);
      expect(res.status).toBe(200);
      //   expect(res.body.data).toEqual(mockUser);
    });
  });

  describe("POST /api/users/logout", () => {
    it("should return 401 if no access token is provided", async () => {
      const res = await request.post("/api/users/logout");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid Token");
    });

    it("should return 401 if invalid token is provided", async () => {
      const res = await request
        .post("/api/users/logout")
        .set("Authorization", "Bearer invalidAccesToken");

      expect(res.status).toBe(401);
    //   expect(res.body.message).toBe("User Anautorized");
    });

    //   it("should return 404 if user is not found", async () => {
    //     // Simulasi UserService.getUserByRefreshToken tidak menemukan user
    //     (UserService.getUserByRefreshToken as jest.Mock).mockResolvedValue(null);

    //     const res = await request
    //       .post("/api/users/logout")
    //       .set("Authorization", "Bearer validtoken")
    //       .set("Cookie", ["refreshToken=validRefreshToken"]);

    //     expect(res.status).toBe(404);
    //     expect(res.body.message).toBe("User not found");
    //   });

    it("should clear refreshToken cookie and return success on valid logout", async () => {
      // Simulasi UserService.getUserByRefreshToken berhasil
      const newUser = await request.post("/api/users/register").send({
        username: "test user has acces token",
        password: "password123",
        name: "test user has acces token",
      });
      const responseLogin = await request.post("/api/users/login").send({
        username: "test user has acces token",
        password: "password123",
      });
      const token = responseLogin.body.data.accessToken;
      console.log(`token = ${token}`)

      const res = await request
        .post("/api/users/logout")
        .set("Authorization", "Bearer " + token)
        .set("Cookie", ["refreshToken=validRefreshToken"]);

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"][0]).toMatch(/refreshToken=;/); // Mengecek cookie refreshToken di-clear
    });
  });

  describe("GET /api/contact", () => {
    //! should get all contacts
    it("should get all contacts", async () => {
      await request.post("/api/users/register").send({
        username: "testuser2",
        password: "password123",
        name: "testuser2",
      });
      const userLogin = await request.post("/api/users/login").send({
        username: "testuser2",
        password: "password123",
      });
      console.log(userLogin.body);
      const res = await request
        .get("/api/contact")
        .set("Authorization", "Bearer " + userLogin.body.data.accessToken);
      expect(res.status).toBe(200);
      // expect(res.body.data).toBeDefined();
      // console.log(res.body);
    });

    it("should get net acces token when valid refresh token", async () => {
      //! register
      const res = await request.post("/api/users/register").send({
        username: "testuser3",
        password: "password123",
        name: "testuser3",
      });
      //! login
      const userLogin = await request.post("/api/users/login").send({
        username: "testuser3",
        password: "password123",
      });
      //! get contact
      const rescontact = await request
        .get("/api/contact")
        .set("Authorization", "Bearer " + userLogin.body.data.accessToken); //! valid accesToken
      //! get token
      const token = userLogin.body.data.accessToken;

      // expect(res2.status).toBe(200);
      // expect(res2.body.data).toBeDefined();
      // console.log(res2.body);
    });

    it("should unautorize when refresh token exp", async () => {});
  });
});
