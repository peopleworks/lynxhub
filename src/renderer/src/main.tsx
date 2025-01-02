import './index.css';
import '@xterm/xterm/css/xterm.css';
import 'overlayscrollbars/overlayscrollbars.css';
import '@ant-design/v5-patch-for-react-19';

import log from 'electron-log/renderer';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';

import {isDev} from '../../cross/CrossUtils';
import {initRouter} from './App/AppRouter';
import {loadExtensions} from './App/Extensions/Vite-Federation';
import loadModules from './App/Modules/ModuleLoader';

await loadModules();
await loadExtensions();
const router = await initRouter();

if (!isDev()) {
  Object.assign(console, log.functions);
}

createRoot(document.getElementById('root') as HTMLElement).render(<RouterProvider router={router} />);
