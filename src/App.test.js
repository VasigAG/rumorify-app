import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the GoogleGenAI library to prevent ESM syntax errors in Jest
jest.mock('@google/genai', () => ({
  GoogleGenAI: class {
    constructor() {
      this.models = {
        generateContent: jest.fn().mockResolvedValue({
            response: { text: () => "Mock Summary" }
        })
      };
    }
  }
}));

test('renders welcome message', () => {
  render(<App />);
  // Check for the heading specifically
  const heading = screen.getByRole('heading', { name: /Login/i });
  expect(heading).toBeInTheDocument();
});
