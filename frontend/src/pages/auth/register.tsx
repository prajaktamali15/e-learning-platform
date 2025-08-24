// src/pages/auth/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { registerUser } from '../../lib/api';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await registerUser(form);

      // ✅ Handle backend response correctly for updated AuthController
      if (data?.authResponse?.access_token && data?.authResponse?.user) {
        localStorage.setItem('token', data.authResponse.access_token);
        localStorage.setItem('role', data.authResponse.user.role);
        localStorage.setItem('name', data.authResponse.user.name ?? '');
        localStorage.setItem('email', data.authResponse.user.email ?? '');

        setSuccess('Registration successful! Redirecting...');

        // Redirect based on role
        switch (data.authResponse.user.role) {
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
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Registration failed');
      }
    } catch (err: any) {
      // Handle backend error message properly
      setError(
        err?.response?.data?.message || // Axios or fetch wrapped error
        err?.message || 
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

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

        <div style={{ marginBottom: '1rem' }}>
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.5rem 1rem', width: '100%' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
