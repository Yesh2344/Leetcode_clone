import { auth } from "./auth";
import router from "./router";

const http = router;

# Added comment
auth.addHttpRoutes(http);

export default http;
