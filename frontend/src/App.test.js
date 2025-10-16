import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the services
jest.mock('./services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('./services/auth', () => ({
  getToken: () => null,
  logout: jest.fn(),
}));

test('renders TaskTrack application', () => {
  render(<App />);
  const homeLink = screen.getByText('Home');
  const loginLink = screen.getByText('Login');
  const registerLink = screen.getByText('Register');
  
  expect(homeLink).toBeInTheDocument();
  expect(loginLink).toBeInTheDocument();
  expect(registerLink).toBeInTheDocument();
});
