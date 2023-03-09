import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import { Provider } from 'react-redux';
import Chat from './views/Chat';
import Home from './views/Home';
import store from './app/store';

const App = () => {

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/:channelName" element={<Chat />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
