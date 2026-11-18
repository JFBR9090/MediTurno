import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MediTurnoProvider } from './context/MediTurnoContext';
import { ToastContainer } from './components/common/Toast';
import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <MediTurnoProvider>
            <ToastContainer />
            <AppRouter />
          </MediTurnoProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

