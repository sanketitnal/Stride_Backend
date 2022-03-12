const redis = require("redis");
const client = redis.createClient(6379, "localhost");
client.connect();

client.on("connect", () => console.log("Redis client connected"));

module.exports = client;
