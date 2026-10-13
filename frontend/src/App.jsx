import { BrowserRouter } from "react-router-dom";

import AppRouter from "./app/router/AppRouter";
import QueryProvider from "./app/providers/QueryProvider";
import { AuthProvider } from "./app/providers/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}

export default App;