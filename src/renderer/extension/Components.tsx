import {Button} from '@nextui-org/react';
import {Fragment, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {RouteObject} from 'react-router-dom';

import NavButton from '../src/App/Components/NavBar/NavButton';
import RouterPagesError from '../src/App/Components/Pages/RouterPagesError';
import {ElementProps} from '../src/App/Extensions/ExtensionTypes';
import {useAppState} from '../src/App/Redux/App/AppReducer';
import {getIconByName} from '../src/assets/icons/SvgIconsContainer';
import {extensionActions, useExtensionState} from './reducer';

// @ts-ignore
export function StatusBarEnd({className, ...props}: ElementProps) {
  const darkMode = useAppState('darkMode');
  return <span className={darkMode ? 'text-danger' : 'text-success'}>Hello End</span>;
}

function ComponentContent() {
  return (
    <div className="flex size-full items-center justify-center text-large">
      I&#39;m a text from extension router page
    </div>
  );
}

function ComponentSetting() {
  return null;
}

export const routePage: RouteObject[] = [
  {
    Component: ComponentContent,
    errorElement: <RouterPagesError />,
    path: 'extContentPath',
  },
  {
    Component: ComponentSetting,
    errorElement: <RouterPagesError />,
    path: 'extSettingPath',
  },
];

export function AddContentButton() {
  return (
    <NavButton badge={false} pageId="extContentPath" title="Ext Content Btn" key={'ext-content-btn'}>
      {getIconByName('Reddit', {className: 'size-full'})}
    </NavButton>
  );
}

export function AddSettingsButton() {
  return (
    <NavButton badge={false} pageId="extSettingPath" title="Ext Setting Btn" key={'ext-setting-btn'}>
      {getIconByName('XSite', {className: 'size-full'})}
    </NavButton>
  );
}

export function CustomHook() {
  const darkMode = useAppState('darkMode');

  useEffect(() => {
    console.log('dark?: ', darkMode);
  }, [darkMode]);

  return <Fragment />;
}

export function Background() {
  return <div className="absolute inset-0 bg-secondary" />;
}

export function HomePage_ReplaceCategories() {
  return (
    <div className="h-64 w-full content-center bg-secondary text-center">
      I&#39;m A category that contain something i don&#39;t know
    </div>
  );
}

export function HomePage_TopScroll() {
  return <div className="h-24 w-full shrink-0 bg-green-700" />;
}

export function HomePage_Top() {
  return <div className="h-24 w-full shrink-0 bg-blue-700" />;
}

export function ReducerTester() {
  const someNumber = useExtensionState('someNumber');
  const dispatch = useDispatch();

  const onPress = () => {
    dispatch(extensionActions.increaseNumber());
  };

  return (
    <div className="flex h-16 w-full flex-row items-center justify-center space-x-4">
      <Button onPress={onPress}>Increase</Button>
      <span>{someNumber}</span>
    </div>
  );
}
