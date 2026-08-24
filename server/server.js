import connectDB from "./config/db.js";
import { ensureAdminUser } from "./utils/auth.util.js";
import app from "./app.js";

connectDB().then(ensureAdminUser);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
