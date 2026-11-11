import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediTurnoProvider } from './context/MediTurnoContext';
import { ToastContainer } from './components/common/Toast';
import { AppRouter } from './routes/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MediTurnoProvider>
          <ToastContainer />
          <AppRouter />
        </MediTurnoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

