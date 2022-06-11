import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import Chat from './views/Chat';
import Home from './views/Home';

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:channelName" element={<Chat />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
