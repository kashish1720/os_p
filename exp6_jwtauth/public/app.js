// API Configuration
const API_BASE = '';

// DOM Elements
const elements = {
  // Forms
  registerForm: document.getElementById('register-form'),
  loginForm: document.getElementById('login-form'),
  
  // Inputs
  regUsername: document.getElementById('reg-username'),
  regPassword: document.getElementById('reg-password'),
  regRole: document.getElementById('reg-role'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  
  // Messages
  registerMessage: document.getElementById('register-message'),
  loginMessage: document.getElementById('login-message'),
  
  // Dashboard
  dashboard: document.getElementById('dashboard'),
  welcome: document.getElementById('welcome'),
  currentUser: document.getElementById('current-user'),
  tokenInfo: document.getElementById('token-info'),
  usersDb: document.getElementById('users-db'),
  apiResponse: document.getElementById('api-response'),
  booksList: document.getElementById('books-list'),
  
  // Buttons
  decodeTokenBtn: document.getElementById('decode-token-btn'),
  copyTokenBtn: document.getElementById('copy-token-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  refreshUsersBtn: document.getElementById('refresh-users-btn'),
  refreshBooksBtn: document.getElementById('refresh-books-btn'),
  testUserBtn: document.getElementById('test-user-btn'),
  testAdminBtn: document.getElementById('test-admin-btn'),
  tokenActions: document.getElementById('token-actions'),
  
  // Tabs
  tabBtns: document.querySelectorAll('.tab-btn'),
  registerTab: document.getElementById('register-tab'),
  loginTab: document.getElementById('login-tab')
};

// Token Management
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'current_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

// API Helper
async function apiCall(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token && !path.includes('/register') && !path.includes('/login')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(API_BASE + path, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Display Helpers
function showMessage(element, message, type = 'info') {
  element.textContent = message;
  element.className = `message-box ${type}`;
  element.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      element.textContent = '';
      element.style.display = 'none';
    }, 3000);
  }
}

function formatJSON(data) {
  return JSON.stringify(data, null, 2);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
}

// Tab Switching
elements.tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    
    // Update buttons
    elements.tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
  });
});

// Register Handler
elements.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    username: elements.regUsername.value.trim(),
    password: elements.regPassword.value,
    role: elements.regRole.value
  };
  
  try {
    showMessage(elements.registerMessage, 'Registering...', 'info');
    const response = await apiCall('/api/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    showMessage(elements.registerMessage, 
      `✅ ${response.message}\nUser ID: ${response.user.id}\nUsername: ${response.user.username}\nRole: ${response.user.role}`, 
      'success');
    
    // Clear form
    elements.registerForm.reset();
    
    // Switch to login tab
    elements.tabBtns[1].click();
    elements.loginUsername.value = data.username;
  } catch (error) {
    showMessage(elements.registerMessage, 
      `❌ Error: ${error.message || JSON.stringify(error)}`, 
      'error');
  }
});

// Login Handler
elements.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    username: elements.loginUsername.value.trim(),
    password: elements.loginPassword.value
  };
  
  try {
    showMessage(elements.loginMessage, 'Logging in...', 'info');
    const response = await apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    setToken(response.token);
    setCurrentUser(response.user);
    
    showMessage(elements.loginMessage, 
      `✅ ${response.message}\nWelcome, ${response.user.username}! (${response.user.role})`, 
      'success');
    
    // Show dashboard
    showDashboard();
    updateDashboard();
    
    // Clear password field
    elements.loginPassword.value = '';
  } catch (error) {
    showMessage(elements.loginMessage, 
      `❌ ${error.message || 'Login failed'}`, 
      'error');
  }
});

// Logout Handler
elements.logoutBtn.addEventListener('click', () => {
  clearToken();
  showMessage(elements.loginMessage, 'Logged out successfully', 'info');
  hideDashboard();
  elements.loginForm.reset();
});

// Copy Token
elements.copyTokenBtn.addEventListener('click', async () => {
  const token = getToken();
  if (!token) {
    showMessage(elements.loginMessage, 'No token available', 'error');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(token);
    showMessage(elements.loginMessage, 'Token copied to clipboard!', 'success');
  } catch (error) {
    showMessage(elements.loginMessage, `Token:\n${token}`, 'info');
  }
});

// Decode Token
elements.decodeTokenBtn.addEventListener('click', async () => {
  const token = getToken();
  if (!token) {
    showMessage(elements.loginMessage, 'No token available. Please login first.', 'error');
    return;
  }
  
  try {
    const data = await apiCall('/api/token/decode');
    displayTokenInfo(data);
  } catch (error) {
    elements.tokenInfo.innerHTML = `<pre class="error">Error: ${error.message || JSON.stringify(error)}</pre>`;
  }
});

function displayTokenInfo(data) {
  const { token, verification } = data;
  
  elements.tokenInfo.innerHTML = `
    <div class="data-item">
      <strong>Token Header:</strong><br>
      <pre>${formatJSON(token.header)}</pre>
    </div>
    <div class="data-item">
      <strong>Token Payload (Contains user data):</strong><br>
      <pre>${formatJSON(token.payload)}</pre>
    </div>
    <div class="data-item">
      <strong>Token Verification:</strong><br>
      <ul>
        <li>Valid: <span style="color: ${verification.isValid ? '#10b981' : '#ef4444'}">${verification.isValid}</span></li>
        <li>Issued At: ${verification.issuedAt ? formatDate(verification.issuedAt) : 'N/A'}</li>
        <li>Expires At: ${verification.expiresAt ? formatDate(verification.expiresAt) : 'N/A'}</li>
        ${verification.error ? `<li>Error: <span style="color: #ef4444">${verification.error}</span></li>` : ''}
      </ul>
    </div>
    <div class="info-text" style="margin-top: 16px;">
      <strong>Note:</strong> The signature is used for verification only and is not displayed for security reasons.
    </div>
  `;
}

// Update Dashboard
async function updateDashboard() {
  await Promise.all([
    updateCurrentUser(),
    updateUsersDatabase(),
    updateBooks(),
    decodeTokenIfAvailable()
  ]);
}

async function updateCurrentUser() {
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    const data = await apiCall('/api/user');
    elements.currentUser.innerHTML = `
      <div class="data-item">
        <strong>User ID:</strong> ${data.user.id}<br>
        <strong>Username:</strong> ${data.user.username}<br>
        <strong>Role:</strong> <span class="role-badge ${data.user.role}">${data.user.role.toUpperCase()}</span><br>
        <strong>Last Access:</strong> ${formatDate(data.timestamp)}
      </div>
    `;
  } catch (error) {
    elements.currentUser.innerHTML = `<pre class="error">Error: ${error.message || 'Failed to fetch user info'}</pre>`;
  }
}

async function updateUsersDatabase() {
  try {
    const data = await apiCall('/api/users');
    const users = data.users || [];
    
    if (users.length === 0) {
      elements.usersDb.innerHTML = '<p class="info-text">No users found in database</p>';
      return;
    }
    
    elements.usersDb.innerHTML = `
      <p style="margin-bottom: 16px;"><strong>Total Users:</strong> ${data.count}</p>
      <div class="data-grid">
        ${users.map(user => `
          <div class="user-card">
            <strong>ID:</strong> ${user.id}<br>
            <strong>Username:</strong> ${user.username}<br>
            <span class="role-badge ${user.role}">${user.role.toUpperCase()}</span><br>
            <small style="color: var(--text-muted);">
              Created: ${formatDate(user.createdAt)}<br>
              Updated: ${formatDate(user.updatedAt)}
            </small>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    if (error.status === 403) {
      elements.usersDb.innerHTML = '<p class="info-text">⚠️ Admin access required to view all users</p>';
    } else {
      elements.usersDb.innerHTML = `<pre class="error">Error: ${error.message || 'Failed to fetch users'}</pre>`;
    }
  }
}

async function updateBooks() {
  try {
    const data = await apiCall('/api/books');
    const books = data.books || [];
    
    if (books.length === 0) {
      elements.booksList.innerHTML = '<p class="info-text">No books in the library yet</p>';
      return;
    }
    
    elements.booksList.innerHTML = `
      <p style="margin-bottom: 16px;"><strong>Total Books:</strong> ${data.count}</p>
      ${books.map(book => `
        <div class="book-item">
          <h4>${book.title}</h4>
          <div class="meta">
            <strong>Author:</strong> ${book.author}<br>
            ${book.isbn ? `<strong>ISBN:</strong> ${book.isbn}<br>` : ''}
            ${book.genre ? `<strong>Genre:</strong> ${book.genre}<br>` : ''}
            ${book.description ? `<strong>Description:</strong> ${book.description}<br>` : ''}
            <strong>Available:</strong> ${book.available !== false ? '✅ Yes' : '❌ No'}<br>
            <small style="color: var(--text-muted);">
              Added: ${formatDate(book.createdAt)}
            </small>
          </div>
        </div>
      `).join('')}
    `;
  } catch (error) {
    elements.booksList.innerHTML = `<pre class="error">Error: ${error.message || 'Failed to fetch books'}</pre>`;
  }
}

async function decodeTokenIfAvailable() {
  const token = getToken();
  if (token) {
    await elements.decodeTokenBtn.click();
  }
}

// Test Protected Routes
elements.testUserBtn.addEventListener('click', async () => {
  try {
    elements.apiResponse.innerHTML = '<p class="info-text">Testing /api/user...</p>';
    const data = await apiCall('/api/user');
    elements.apiResponse.innerHTML = `
      <div class="data-item">
        <strong>Response:</strong><br>
        <pre>${formatJSON(data)}</pre>
      </div>
    `;
  } catch (error) {
    elements.apiResponse.innerHTML = `
      <div class="data-item" style="border-left-color: var(--danger);">
        <strong>Error (${error.status || 'Unknown'}):</strong><br>
        <pre>${formatJSON(error)}</pre>
      </div>
    `;
  }
});

elements.testAdminBtn.addEventListener('click', async () => {
  try {
    elements.apiResponse.innerHTML = '<p class="info-text">Testing /api/admin...</p>';
    const data = await apiCall('/api/admin');
    elements.apiResponse.innerHTML = `
      <div class="data-item">
        <strong>Response:</strong><br>
        <pre>${formatJSON(data)}</pre>
      </div>
    `;
  } catch (error) {
    const isForbidden = error.status === 403;
    elements.apiResponse.innerHTML = `
      <div class="data-item" style="border-left-color: ${isForbidden ? 'var(--warning)' : 'var(--danger)'};">
        <strong>${isForbidden ? 'Forbidden (403)' : `Error (${error.status || 'Unknown'})`}:</strong><br>
        <pre>${formatJSON(error)}</pre>
        ${isForbidden ? '<p style="margin-top: 8px; color: var(--warning);">⚠️ Admin role required to access this endpoint</p>' : ''}
      </div>
    `;
  }
});

// Refresh Handlers
elements.refreshUsersBtn.addEventListener('click', updateUsersDatabase);
elements.refreshBooksBtn.addEventListener('click', updateBooks);

// Dashboard Visibility
function showDashboard() {
  elements.dashboard.style.display = 'block';
  elements.welcome.style.display = 'none';
  elements.tokenActions.style.display = 'flex';
}

function hideDashboard() {
  elements.dashboard.style.display = 'none';
  elements.welcome.style.display = 'block';
  elements.tokenActions.style.display = 'none';
  elements.currentUser.innerHTML = '<p>Loading...</p>';
  elements.tokenInfo.innerHTML = '<p class="info-text">Login to see your JWT token structure</p>';
  elements.usersDb.innerHTML = '<p class="info-text">Only admins can view all users</p>';
  elements.apiResponse.innerHTML = '';
}

// Initialize
function init() {
  const token = getToken();
  const user = getCurrentUser();
  
  if (token && user) {
    showDashboard();
    updateDashboard();
  } else {
    hideDashboard();
  }
  
  // Auto-refresh dashboard every 30 seconds when logged in
  if (token) {
    setInterval(() => {
      if (elements.dashboard.style.display !== 'none') {
        updateDashboard();
      }
    }, 30000);
  }
}

// Start the app
init();
