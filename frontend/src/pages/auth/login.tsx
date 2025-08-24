// src/pages/auth/login.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginUser } from '../../lib/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      redirectByRole(role);
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Helper: Redirect based on role
  const redirectByRole = (role: string) => {
    switch (role) {
      case 'STUDENT':
        router.replace('/student/dashboard');
        break;
      case 'INSTRUCTOR':
        router.replace('/instructor/dashboard');
        break;
      case 'ADMIN':
        router.replace('/admin/dashboard');
        break;
      default:
        router.replace('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(form);

      if (data?.access_token && data?.user?.role) {
        // ✅ Save token & role in localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('name', data.user.name ?? '');
        localStorage.setItem('email', data.user.email ?? '');

        // ✅ Redirect user by role
        redirectByRole(data.user.role);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.5rem 1rem', width: '100%' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
