const apiBase = '';
const $ = (id) => document.getElementById(id);
const show = (id) => { ['signup','login','profile'].forEach(s => $(s).classList.add('hidden')); $(id).classList.remove('hidden'); };
const msg = (text, cls = 'ok') => { $('messages').innerHTML = `<div class="${cls}">${text}</div>`; };

const tokenKey = 'demo_jwt_token';
const getToken = () => localStorage.getItem(tokenKey);
const setToken = (t) => { localStorage.setItem(tokenKey, t); renderToken(); };
const clearToken = () => { localStorage.removeItem(tokenKey); renderToken(); };

function renderToken() {
	$('token-display') && ($('token-display').textContent = getToken() || '(not logged in)');
}

function showRequestPreview(method, url, body, headers) {
	const lines = [];
	lines.push(`${method} ${url}`);
	if (headers) {
		Object.entries(headers).forEach(([k,v]) => lines.push(`${k}: ${v}`));
	}
	if (body) {
		lines.push('');
		lines.push(JSON.stringify(body, null, 2));
	}
	$('req-preview') && ($('req-preview').textContent = lines.join('\n'));
}

function showResponsePreview(status, data) {
	$('res-preview') && ($('res-preview').textContent = `${status}\n\n` + JSON.stringify(data, null, 2));
}

window.addEventListener('DOMContentLoaded', () => {
	$('show-signup').onclick = () => show('signup');
	$('show-login').onclick = () => show('login');
	$('show-profile').onclick = () => { show('profile'); loadProfile(); };
	$('logout').onclick = () => { clearToken(); msg('Logged out'); };

	$('do-signup').onclick = doSignup;
	$('do-login').onclick = doLogin;

	renderToken();
	show('signup');
});

async function doSignup() {
	const body = {
		username: $('su-username').value.trim(),
		email: $('su-email').value.trim(),
		password: $('su-password').value
	};
	try {
		const url = apiBase + '/signup';
		const headers = { 'Content-Type': 'application/json' };
		showRequestPreview('POST', url, body, headers);
		const res = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		});
		const data = await res.json();
		showResponsePreview(`${res.status} ${res.statusText || ''}`.trim(), data);
		if (!res.ok) throw new Error(data.error || 'Signup failed');
		msg('Signup successful. You can login now.', 'ok');
		show('login');
	} catch (e) {
		msg(e.message, 'err');
	}
}

async function doLogin() {
	const body = {
		email: $('li-email').value.trim(),
		password: $('li-password').value
	};
	try {
		const url = apiBase + '/login';
		const headers = { 'Content-Type': 'application/json' };
		showRequestPreview('POST', url, body, headers);
		const res = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		});
		const data = await res.json();
		showResponsePreview(`${res.status} ${res.statusText || ''}`.trim(), data);
		if (!res.ok) throw new Error(data.error || 'Login failed');
		setToken(data.token);
		msg('Login successful', 'ok');
		show('profile');
		loadProfile();
	} catch (e) {
		msg(e.message, 'err');
	}
}

async function loadProfile() {
	const token = getToken();
	if (!token) { msg('Please login first', 'err'); return; }
	try {
		const url = apiBase + '/profile';
		const headers = { Authorization: 'Bearer ' + token };
		showRequestPreview('GET', url, null, headers);
		const res = await fetch(url, { headers });
		const data = await res.json();
		showResponsePreview(`${res.status} ${res.statusText || ''}`.trim(), data);
		if (!res.ok) throw new Error(data.error || 'Failed to load profile');
		$('profile-data').textContent = JSON.stringify(data, null, 2);
		msg('Profile loaded', 'ok');
	} catch (e) {
		msg(e.message, 'err');
	}
}
