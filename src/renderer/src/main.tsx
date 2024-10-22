import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@mantine/core/styles.css';

import log from 'electron-log/renderer';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';

import {initRouter} from './App/AppRouter';
import {isDevRenderer} from './App/Utils/UtilFunctions';

const router = await initRouter();

if (!isDevRenderer()) {
  Object.assign(console, log.functions);
}

createRoot(document.getElementById('root') as HTMLElement).render(<RouterProvider router={router} />);
