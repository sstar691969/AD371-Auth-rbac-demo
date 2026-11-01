

const message = document.getElementById('message');
const authPanel = document.getElementById('auth-panel');
const accountPanel = document.getElementById('account-panel');
const adminPanel = document.getElementById('admin-panel');

const accountEmail = document.getElementById('account-email');
const accountRole = document.getElementById('account-role');
const userList = document.getElementById('user-list');

// Display messages to the user
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.backgroundColor = isError ? '#fee2e2' : '#dcfce7';
    message.style.color = isError ? '#991b1b' : '#166534';
}

// Send requests to the backend API
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'same-origin'
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
    }

    return data;
}

// Update the page based on the logged-in account
function showAccount(user) {
    authPanel.classList.add('hidden');
    accountPanel.classList.remove('hidden');

    accountEmail.textContent = `Email: ${user.email}`;
    accountRole.textContent = `Role: ${user.role}`;

    if (user.role === 'Admin') {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }
}

// Show the registration form
document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const result = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        showMessage(result.message + ' You can now log in.');
        event.target.reset();
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Show the login form
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const result = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        showAccount(result.user);
        showMessage(result.message);
        event.target.reset();
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Log out the current account
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const result = await apiRequest('/api/auth/logout', {
            method: 'POST'
        });

        authPanel.classList.remove('hidden');
        accountPanel.classList.add('hidden');
        adminPanel.classList.add('hidden');
        userList.textContent = '';

        showMessage(result.message);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Load the user list (Admin only)
document.getElementById('load-users-button').addEventListener('click', async () => {
    try {
        const result = await apiRequest('/api/admin/users');
        userList.textContent = JSON.stringify(result.users, null, 2);
        showMessage(result.message);
    } catch (error) {
        showMessage(error.message, true);
    }
});

// Restore the account display when the page is refreshed
async function checkCurrentSession() {
    try {
        const result = await apiRequest('/api/auth/me');
        showAccount(result.user);
    } catch (error) {
        authPanel.classList.remove('hidden');
        accountPanel.classList.add('hidden');
        adminPanel.classList.add('hidden');
    }
}

checkCurrentSession();
