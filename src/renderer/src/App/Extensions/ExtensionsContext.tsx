import {compact, isEmpty} from 'lodash';
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';

import {ElementComp, ExtensionModal, ExtensionNavBar} from '../../../../cross/ExtensionTypes';
import {
  ExtensionAppBackground,
  ExtensionImport,
  ExtensionStatusBar,
  ExtensionTitleBar,
} from '../../../../cross/ExtensionTypes';
import {loadModal, loadNavBar, loadStatusBar, loadTitleBar} from './ExtensionLoader';
import {ImportExtensions} from './Vite-Federation';

type ExtensionContextData = {
  loadingExtensions: boolean;
  statusBar: ExtensionStatusBar;
  titleBar: ExtensionTitleBar;
  navBar: ExtensionNavBar;
  modals: ExtensionModal;
  background: ExtensionAppBackground;
  customHooks: ElementComp[];
};

const ExtensionContext = createContext<ExtensionContextData>({
  loadingExtensions: false,
  statusBar: undefined,
  titleBar: undefined,
  navBar: undefined,
  modals: undefined,
  background: undefined,
  customHooks: [],
});

export default function ExtensionsProvider({children}: {children: ReactNode}) {
  const [loadingExtensions, setLoadingExtensions] = useState<boolean>(true);

  const [statusBar, setStatusBar] = useState<ExtensionStatusBar>(undefined);
  const [titleBar, setTitleBar] = useState<ExtensionTitleBar>(undefined);
  const [navBar, setNavBar] = useState<ExtensionNavBar>(undefined);
  const [modals, setModals] = useState<ExtensionModal>(undefined);
  const [background, setBackground] = useState<ExtensionAppBackground>(undefined);
  const [customHooks, setCustomHooks] = useState<ElementComp[]>([]);

  useEffect(() => {
    const loadExtensions = async () => {
      const importedExtensions: ExtensionImport[] = await ImportExtensions();

      const StatusBars = compact(importedExtensions.map(ext => ext.StatusBar));
      const TitleBar = compact(importedExtensions.map(ext => ext.TitleBar));
      const NavBar = compact(importedExtensions.map(ext => ext.NavBar));
      const Modals = compact(importedExtensions.map(ext => ext.Modals));
      const Background = compact(importedExtensions.map(ext => ext.Background));
      const CustomHooks = compact(importedExtensions.map(ext => ext.CustomHook));

      if (!isEmpty(StatusBars)) loadStatusBar(setStatusBar, StatusBars);
      if (!isEmpty(TitleBar)) loadTitleBar(setTitleBar, TitleBar);
      if (!isEmpty(NavBar)) loadNavBar(setNavBar, NavBar);
      if (!isEmpty(Modals)) loadModal(setModals, Modals);
      if (!isEmpty(Background)) setBackground(Background[0]);
      if (!isEmpty(CustomHooks)) setCustomHooks(CustomHooks);

      setLoadingExtensions(false);
    };

    loadExtensions();
  }, []);

  const contextValue: ExtensionContextData = useMemo(() => {
    return {loadingExtensions, statusBar, navBar, modals, titleBar, background, customHooks};
  }, [loadingExtensions, statusBar, navBar, modals, titleBar, background, customHooks]);

  return <ExtensionContext.Provider value={contextValue}>{children}</ExtensionContext.Provider>;
}

export const useExtensions = () => {
  return useContext(ExtensionContext);
};
