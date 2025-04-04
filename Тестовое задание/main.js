const config = {
  clientId: "92f1139e-65b0-42ec-9d70-1572ccc7379c",
  clientSecret:
    "em5AohtIBYlHPDE2i49U19fuWngG2Gyz78SHZRWXG8Hse4qI3qZ99lOmtoU4q72K",
  authCode:
    "def502009ada411e84a62a89b77786e36e3fee8790cd6a6bd7e66e17ac2eff410cf923dcaa851eae536306c30adf83110abe769c51b91e7890762b6fc9251b0caa6a3cf51c45d8b902ebaa8456dedf8ab3ad165f210e90c3ed03e28cd99faf24451791eb5402079534e4e829b8f7056725a375a10baea680b00653270b82bed8a79067e6e199bd40d2755a81dd20a6f5507a55c6c5c4c583a412d1afc0b474ddc3fd0b134008b929f1f5a6449183cd3ace7d6e74e60a8147923c17b5dbe33673928237e6c7c2c0168c03bebf5b311ad055fb25e9de3964d515fe973a5a9abe7b633197da86d2cd5893867bb91bd1fb21f14455a723d3c655e345fffd03e27cb09c3030d00bc37245f655f97f0b5178d223aabe0fad90e4cb4bd5aac5b340188d2f861d4e3236d0ef3f7d407f25d7995f32258e83f102ec0973c95d3400e4cbcf48847af6f3af4f823f4a8ae841bb8a829cdd8c394c928fbcfcfc6fc8dfe762972deb661dbde6a05d94b89f1e3e1492024972c605e5f6794d27c0c0f3bc95ad6f69bf66a22ae8da05142c22b99a3aaafe28dbe82b0ceb576ef3301a9132f5194da61a0486e5bfafb0c9dce3e3e5c9bcc35fd84db008037f067cb90bc72b107d59d62899dad6cda066fa3255976a8bdbe82f3bb12bff3a9e43fabd45686f7d74b5764bd8c74d45e5776795a5ab84c2",
  proxyUrl: "http://localhost:3000/proxy",
  accessToken: null,
  refreshToken: null,
  accountDomain: "dubaework.amocrm.ru",
};

class AmoCRMClient {
  constructor(config) {
    this.config = config;
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  // Проверка срока действия токена
  isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  async makeRequest(endpoint, params = {}) {
    // Проверяем актуальность токена
    if (this.isTokenExpired(this.config.accessToken)) {
      await this.refreshAccessToken();
    }

    const url = new URL(`${this.config.proxyUrl}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        Accept: "application/json",
        "X-API-Version": "4",
      },
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      return this.makeRequest(endpoint, params);
    }

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const text = await response.text();
    if (!text) return {};
    return JSON.parse(text);
  }

  async getAccessToken() {
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "authorization_code",
      code: this.config.authCode,
      redirect_uri: `https://${this.config.accountDomain}/`,
    });

    const response = await fetch(
      `${this.config.proxyUrl}/oauth2/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const data = await response.json();
    if (!data.access_token) throw new Error("Failed to get access token");

    // Сохраняем токены в localStorage
    localStorage.setItem("amoCRM_accessToken", data.access_token);
    localStorage.setItem("amoCRM_refreshToken", data.refresh_token);

    this.config.accessToken = data.access_token;
    this.config.refreshToken = data.refresh_token;
    return data;
  }

  async refreshAccessToken() {
    if (!this.config.refreshToken)
      throw new Error("No refresh token available");

    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.config.refreshToken,
      redirect_uri: `https://${this.config.accountDomain}/`,
    });

    const response = await fetch(
      `${this.config.proxyUrl}/oauth2/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );

    const data = await response.json();

    // Сохраняем новые токены
    localStorage.setItem("amoCRM_accessToken", data.access_token);
    localStorage.setItem("amoCRM_refreshToken", data.refresh_token);

    this.config.accessToken = data.access_token;
    this.config.refreshToken = data.refresh_token;
    return data;
  }

  async fetchDeals() {
    try {
      const deals = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const dealsData = await this._throttledRequest("/api/v4/leads", {
          with: "contacts",
          limit: 250,
          page,
        });

        if (dealsData._embedded?.leads?.length) {
          deals.push(...dealsData._embedded.leads);
          page++;
        } else {
          hasMore = false;
        }
      }

      const contacts = await this._fetchContactsForDeals(deals);
      return this._enrichDealsWithContacts(deals, contacts);
    } catch (error) {
      console.error("Error fetching deals:", error);
      throw error;
    }
  }

  async fetchTasks(dealId) {
    return this._throttledRequest("/api/v4/tasks", {
      "filter[entity_id]": dealId,
      "filter[entity_type]": "leads",
      limit: 1,
      order: "complete_till",
    });
  }

  async _fetchContactsForDeals(deals) {
    const contactIds = [
      ...new Set(
        deals.flatMap(
          (deal) => deal._embedded?.contacts?.map((c) => c.id) || []
        )
      ),
    ];

    const contacts = [];
    for (let i = 0; i < contactIds.length; i += 2) {
      const chunk = contactIds.slice(i, i + 2);
      const chunkContacts = await Promise.all(
        chunk.map((id) => this._throttledRequest(`/api/v4/contacts/${id}`))
      );
      contacts.push(...chunkContacts);
      await this._delay(1000);
    }

    return contacts;
  }

  _enrichDealsWithContacts(deals, contacts) {
    return deals.map((deal) => ({
      ...deal,
      contacts: deal._embedded?.contacts?.map(
        (contact) => contacts.find((c) => c.id === contact.id) || {}
      ),
    }));
  }

  async _throttledRequest(endpoint, params) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ endpoint, params, resolve, reject });
      if (!this.isProcessingQueue) this._processQueue();
    });
  }

  async _processQueue() {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const { endpoint, params, resolve, reject } = this.requestQueue.shift();

    try {
      const result = await this.makeRequest(endpoint, params);
      resolve(result);
    } catch (error) {
      reject(error);
    }

    await this._delay(500);
    this._processQueue();
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function formatDate(timestamp) {
  if (!timestamp) return "Нет данных";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("ru-RU");
}

function getTaskStatus(task) {
  if (!task?.complete_till) return { color: "red", text: "Нет задачи" };

  const now = new Date();
  const taskDate = new Date(task.complete_till * 1000);
  const diffDays = Math.floor((taskDate - now) / (1000 * 60 * 60 * 24));

  if (taskDate < now) return { color: "red", text: "Просрочена" };
  if (diffDays === 0) return { color: "green", text: "Сегодня" };
  return { color: "yellow", text: `Через ${diffDays} дн.` };
}

document.addEventListener("DOMContentLoaded", () => {
  // Загружаем сохраненные токены
  const savedAccessToken = localStorage.getItem("amoCRM_accessToken");
  const savedRefreshToken = localStorage.getItem("amoCRM_refreshToken");

  if (savedAccessToken && savedRefreshToken) {
    config.accessToken = savedAccessToken;
    config.refreshToken = savedRefreshToken;
  }

  const client = new AmoCRMClient(config);
  const authBtn = document.getElementById("authBtn");
  const loader = document.getElementById("loader");
  const dealsTableBody = document.querySelector("#dealsTable tbody");
  const errorAlert = document.createElement("div");

  errorAlert.className = "alert alert-danger mt-3";
  errorAlert.style.display = "none";
  dealsTableBody.parentElement.parentElement.after(errorAlert);

  // Добавляем кнопку выхода
  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn-outline-danger ms-2";
  logoutBtn.innerHTML = "Выйти";
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("amoCRM_accessToken");
    localStorage.removeItem("amoCRM_refreshToken");
    location.reload();
  });
  authBtn.parentNode.appendChild(logoutBtn);

  let currentOpenRow = null;

  async function loadDeals() {
    try {
      showLoading(true);
      clearError();

      if (
        !client.config.accessToken ||
        client.isTokenExpired(client.config.accessToken)
      ) {
        await client.getAccessToken();
      }

      const deals = await client.fetchDeals();
      renderDeals(deals);
    } catch (error) {
      showError(`Ошибка загрузки: ${error.message}`);
    } finally {
      showLoading(false);
    }
  }

  function renderDeals(deals) {
    dealsTableBody.innerHTML = "";

    if (!deals || deals.length === 0) {
      dealsTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4">Нет сделок для отображения</td>
          </tr>
        `;
      return;
    }

    deals.forEach((deal) => {
      const contact = deal.contacts[0] || {};
      const phone =
        contact.custom_fields_values?.find((f) => f.field_code === "PHONE")
          ?.values?.[0]?.value || "—";

      const row = document.createElement("tr");
      row.className = "deal-row align-middle";
      row.innerHTML = `
          <td>${deal.id}</td>
          <td>${deal.name || "—"}</td>
          <td>${
            deal.price ? deal.price.toLocaleString("ru-RU") + " ₽" : "0 ₽"
          }</td>
          <td>${contact.name || "—"}</td>
          <td>${phone}</td>
        `;

      row.addEventListener("click", () => toggleDealDetails(deal, row));
      dealsTableBody.appendChild(row);
    });
  }

  async function toggleDealDetails(deal, row) {
    if (currentOpenRow === row) {
      closeDetails();
      return;
    }

    closeDetails();
    currentOpenRow = row;

    const detailRow = document.createElement("tr");
    detailRow.className = "detail-row";
    detailRow.innerHTML = `
        <td colspan="5" class="p-3">
          <div class="d-flex justify-content-center py-2">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
        </td>
      `;

    row.after(detailRow);
    row.classList.add("table-active");

    try {
      const tasksData = await client.fetchTasks(deal.id);
      const task = tasksData._embedded?.tasks?.[0];
      const status = getTaskStatus(task);

      detailRow.innerHTML = `
          <td colspan="5" class="p-3 bg-light">
            <div class="d-flex flex-column gap-2">
              <div><strong>ID сделки:</strong> ${deal.id}</div>
              <div><strong>Дата создания:</strong> ${formatDate(
                deal.created_at
              )}</div>
              <div class="d-flex align-items-center gap-2">
                <div class="status-dot bg-${status.color}"></div>
                <span>${status.text}${
        task ? ` (${formatDate(task.complete_till)})` : ""
      }</span>
              </div>
            </div>
          </td>
        `;
    } catch (error) {
      detailRow.innerHTML = `
          <td colspan="5" class="p-3 bg-light text-danger">
            Ошибка загрузки задач: ${error.message}
          </td>
        `;
    }
  }

  function closeDetails() {
    if (currentOpenRow) {
      currentOpenRow.classList.remove("table-active");
      const detailRow = currentOpenRow.nextElementSibling;
      if (detailRow && detailRow.classList.contains("detail-row")) {
        detailRow.remove();
      }
      currentOpenRow = null;
    }
  }

  function showLoading(isLoading) {
    authBtn.disabled = isLoading;
    loader.style.display = isLoading ? "inline-block" : "none";
    authBtn.querySelector(".btn-text").textContent = isLoading
      ? "Загрузка..."
      : "Загрузить сделки";
  }

  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = "block";
  }

  function clearError() {
    errorAlert.style.display = "none";
  }

  // Добавляем текст в кнопку
  const btnText = document.createElement("span");
  btnText.className = "btn-text";
  btnText.textContent = "Загрузить сделки";
  authBtn.innerHTML = "";
  authBtn.appendChild(btnText);

  authBtn.addEventListener("click", loadDeals);

  // Автозагрузка при наличии токенов
  if (config.accessToken && config.refreshToken) {
    loadDeals();
  }
});
