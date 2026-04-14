import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  );
}
