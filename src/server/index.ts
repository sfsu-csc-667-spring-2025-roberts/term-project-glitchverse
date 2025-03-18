import express from "express";
import rootRoutes from "./routes/root";
import httpErrors from "http-errors";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", rootRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((req, res, next) => {
  next(httpErrors(404));
});