import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FixItHub API",
      version: "1.0.0",
      description: "API Documentation for Repair Service Marketplace",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local development server" },
    ],
  },
  apis: ["./routes/*.js", "./server.js"], // Scan both routes and server.js
};

const specs = swaggerJsdoc(options);

export default specs;
