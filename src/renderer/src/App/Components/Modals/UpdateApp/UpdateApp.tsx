import {Button, CircularProgress, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {CollapseProps, Divider, message, Typography} from 'antd';
import {isEmpty, isNil} from 'lodash';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {APP_BUILD_NUMBER, WIN_RELEASE_URL_V2} from '../../../../../../cross/CrossConstants';
import {AppUpdateData, AppUpdateInfo, ChangelogItem, UpdateDownloadProgress} from '../../../../../../cross/CrossTypes';
import {useCardsState} from '../../../Redux/AI/CardsReducer';
import {modalActions, useModalsState} from '../../../Redux/AI/ModalsReducer';
import {settingsActions} from '../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../Redux/Store';
import {useUserState} from '../../../Redux/User/UserReducer';
import rendererIpc from '../../../RendererIpc';
import {modalMotionProps} from '../../../Utils/Constants';
import Downloaded from './Downloaded';
import Downloading from './Downloading';
import Info from './Info';

function useRenderItems() {
  const renderSubItems = useCallback((items?: ChangelogItem[], parentKey: string = '') => {
    if (isNil(items) || isEmpty(items)) return null;

    return (
      <ul style={{paddingLeft: '20px'}}>
        {items.map((item, index) => {
          const currentKey = `${parentKey}_${index}`;
          return (
            <Fragment key={currentKey}>
              <li>{item.label}</li>
              {item.subitems && renderSubItems(item.subitems, currentKey)}
            </Fragment>
          );
        })}
      </ul>
    );
  }, []);

  return renderSubItems;
}

/** Manage updating application */
const UpdateApp = () => {
  const {isOpen} = useModalsState('updateApp');
  const isRunningAI = useCardsState('runningCard').isRunning;
  const [items, setItems] = useState<CollapseProps['items']>([]);
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo>();
  const [downloadProgress, setDownloadProgress] = useState<UpdateDownloadProgress>();
  const [downloadState, setDownloadState] = useState<'failed' | 'completed' | 'progress' | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fetched, setFetched] = useState<boolean>(false);
  const updateChannel = useUserState('updateChannel');

  const dispatch = useDispatch<AppDispatch>();

  const listenProgress = useCallback(() => {
    rendererIpc.appUpdate.offStatus();
    rendererIpc.appUpdate.status((_, result) => {
      if (result === 'update-available') {
        setDownloadProgress(undefined);
        dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: true}));
        message.info('New Update Available!');
        if (!isRunningAI) {
          dispatch(modalActions.openModal('updateApp'));
        }
      } else if (typeof result !== 'string' && 'total' in result) {
        setDownloadState('progress');
        if (result) {
          setDownloadProgress(result);
        }
      } else {
        setDownloadProgress(undefined);
        if (result === 'update-downloaded') {
          setDownloadState('completed');
        } else {
          setDownloadState('failed');
          setErrorMsg(result);
        }
      }
    });
  }, [dispatch, isRunningAI]);

  const onClose = useCallback(() => {
    dispatch(modalActions.closeModal('updateApp'));
  }, [dispatch]);

  const cancel = useCallback(() => {
    setDownloadState(undefined);
  }, []);

  const startDownload = useCallback(() => {
    listenProgress();
    rendererIpc.appUpdate.download();
    setDownloadProgress(undefined);
    setDownloadState('progress');
  }, [listenProgress]);

  const cancelDownload = useCallback(() => {
    rendererIpc.appUpdate.offStatus();
    rendererIpc.appUpdate.cancel();
    setDownloadState(undefined);
  }, []);

  const tryAgain = useCallback(() => {
    startDownload();
  }, [startDownload]);

  const renderSubItems = useRenderItems();

  useEffect(() => {
    listenProgress();

    async function fetchData() {
      const result: CollapseProps['items'] = [];
      const response = await fetch(WIN_RELEASE_URL_V2);
      const data = (await response.json()) as AppUpdateData;

      const isEA = updateChannel === 'ea';
      const latestBuild = (isEA ? data.earlyAccess?.build : data.currentBuild) || 0;

      if (latestBuild > APP_BUILD_NUMBER) {
        const version = (isEA ? data.earlyAccess?.version : data.currentVersion) || '';
        const build = (isEA ? data.earlyAccess?.build : data.currentBuild) || 0;
        const date = (isEA ? data.earlyAccess?.releaseDate : data.releaseDate) || '';

        setUpdateInfo({currentBuild: build, currentVersion: version, releaseDate: date});

        if (isEmpty(data.changeLog)) return;

        data.changeLog.map((change, index) => {
          if (change.build <= APP_BUILD_NUMBER || change.build > latestBuild) return;
          const children = change.changes.map((item, index) => {
            return (
              <Typography.Paragraph key={index}>
                <ul>
                  <Divider>{item.title}</Divider>
                  {renderSubItems(item.items, `section_${index}`)}
                </ul>
              </Typography.Paragraph>
            );
          });
          result.push({
            key: index,
            label: change.version,
            children,
          });
        });

        setItems(result);
        setFetched(true);
      }
    }

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, updateChannel]);

  const renderTitle = useMemo(() => {
    switch (downloadState) {
      case 'failed':
        return 'Download Unsuccessful';
      case 'completed':
        return 'Download Complete';
      case 'progress':
        return 'Download in Progress';
      default:
        return 'Update Information';
    }
  }, [downloadState]);

  const renderBody = () => {
    switch (downloadState) {
      case 'failed':
        return <Downloaded success={false} cancel={cancel} onClose={onClose} errMsg={errorMsg} tryAgain={tryAgain} />;
      case 'completed':
        return <Downloaded cancel={cancel} onClose={onClose} tryAgain={tryAgain} success />;
      case 'progress':
        return <Downloading progress={downloadProgress} />;
      default:
        return fetched ? (
          <Info items={items} updateInfo={updateInfo} />
        ) : (
          <CircularProgress size="lg" color="secondary" label="Retrieving Release Notes..." />
        );
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: '!top-10', wrapper: '!top-10 scrollbar-hide'}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-success">{renderTitle}</ModalHeader>
        <ModalBody className="items-center pb-5 scrollbar-hide">{renderBody()}</ModalBody>
        {downloadState !== 'completed' && downloadState !== 'failed' && (
          <ModalFooter>
            {downloadState === undefined && (
              <Button color="success" variant="light" onPress={startDownload} className="cursor-default">
                Download
              </Button>
            )}
            {downloadState === 'progress' && (
              <Button color="warning" variant="light" onPress={cancelDownload} className="cursor-default">
                Cancel
              </Button>
            )}
            <Button color="danger" variant="light" onPress={onClose} className="cursor-default">
              Close
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateApp;
