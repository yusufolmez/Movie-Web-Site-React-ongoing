import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter as Router } from "react-router-dom";
import { getConfig } from "./config";

// Yönlendirme işlemini `useEffect` içinde yapıyoruz
const onRedirectCallback = (appState) => {
  window.location.href = appState?.returnTo || window.location.pathname;
};

const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? { audience: config.audience } : null),
  },
};

const root = createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider {...providerConfig}>
    {/* Router component'ini en dışta sarmalıyoruz */}
    <Router>
      <App />
    </Router>
  </Auth0Provider>
);

// Eğer uygulamanızın çevrimdışı çalışmasını ve daha hızlı yüklenmesini isterseniz, 
// unregister() yerine register() fonksiyonunu kullanabilirsiniz.
// Bu, bazı zorluklarla birlikte gelir. Service Worker hakkında daha fazla bilgi için: 
// https://bit.ly/CRA-PWA
serviceWorker.unregister();
