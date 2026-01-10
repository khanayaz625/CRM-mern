import app from "./api/index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Backend server started successfully");
  console.log(`🌐 Listening on port ${PORT}`);
});
