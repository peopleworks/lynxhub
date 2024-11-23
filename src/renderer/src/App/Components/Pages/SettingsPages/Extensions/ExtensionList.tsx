import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Link,
  Skeleton,
  Spinner,
  User,
} from '@nextui-org/react';
import {Empty, List, Typography} from 'antd';
import {motion} from 'framer-motion';
import {isEmpty, isNil} from 'lodash';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {Extension_ListData} from '../../../../../../../cross/CrossTypes';
import {getIconByName} from '../../../../../assets/icons/SvgIconsContainer';
import {useAppState} from '../../../../Redux/App/AppReducer';
import {useFetchExtensions} from './ExtensionsUtils';

type Props = {
  selectedExt: Extension_ListData | undefined;
  setSelectedExt: Dispatch<SetStateAction<Extension_ListData | undefined>>;
};

export default function ExtensionList({selectedExt, setSelectedExt}: Props) {
  const [selectedKeys, setSelectedKeys] = useState('all');
  const [list, setList] = useState<Extension_ListData[]>([]);
  const [installed] = useState<string[]>(['debug_toolkit', 'code_snippets_manager']);
  const [isLoaded] = useState<boolean>(true);
  const isDarkMode = useAppState('darkMode');

  const {data, loading} = useFetchExtensions();

  useEffect(() => {
    if (!isEmpty(data)) setList(data);
  }, [data]);

  const sortedList = useMemo(
    () =>
      [...list].sort((a, b) => {
        const aInstalled = installed.includes(a.id);
        const bInstalled = installed.includes(b.id);

        if (aInstalled && !bInstalled) return -1;
        if (!aInstalled && bInstalled) return 1;
        return 0;
      }),
    [list, installed],
  );

  useEffect(() => {
    setSelectedExt(prevState => (isNil(prevState) ? sortedList[0] : prevState));
  }, [sortedList]);

  const filterMenu = useCallback(() => {
    return (
      <>
        <Dropdown size="sm" closeOnSelect={false} className="border !border-foreground/15">
          <DropdownTrigger>
            <Button radius="none" variant="light" className="cursor-default" isIconOnly>
              {getIconByName('MenuDots', {className: 'rotate-90 size-4'})}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="faded"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            // @ts-ignore-next-line
            onSelectionChange={setSelectedKeys}>
            <DropdownSection title="Filter">
              <DropdownItem key="installed" className="cursor-default">
                Installed
              </DropdownItem>
              <DropdownItem key="feature" className="cursor-default">
                Feature
              </DropdownItem>
              <DropdownItem key="tools" className="cursor-default">
                Tools
              </DropdownItem>
              <DropdownItem key="games" className="cursor-default">
                Games
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </>
    );
  }, []);

  const renderList = useCallback(
    (item: Extension_ListData) => {
      return (
        <List.Item
          className={
            `hover:bg-foreground-50 ${selectedExt?.id === item.id && 'bg-foreground-50'} ` +
            ` transition-colors duration-200 relative`
          }
          onClick={() => setSelectedExt(item)}>
          {selectedExt?.id === item.id && (
            <motion.div
              layoutId="sel"
              transition={{bounce: 0.2, duration: 0.4, type: 'spring'}}
              className="inset-y-0 left-0 w-[0.15rem] bg-secondary absolute"
            />
          )}
          <div className="flex flex-col gap-y-1">
            <Skeleton isLoaded={isLoaded} className="rounded-lg">
              <User
                description={
                  <div className="space-x-2">
                    <span>{item.version}</span>
                    <span>{item.developer}</span>
                  </div>
                }
                name={
                  <div className="space-x-2">
                    <Link
                      href={item.url}
                      className="text-small text-primary-500 transition-colors duration-300"
                      isExternal>
                      {item.title}
                    </Link>
                    {installed.includes(item.id) && (
                      <Chip size="sm" radius="sm" variant="faded" color="success">
                        Installed
                      </Chip>
                    )}
                  </div>
                }
                className="justify-start mt-2"
                avatarProps={{src: item.avatarUrl}}
              />
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className="rounded-lg">
              <Typography.Paragraph>{item.description}</Typography.Paragraph>
            </Skeleton>
          </div>
        </List.Item>
      );
    },
    [list, installed, selectedExt],
  );

  return (
    <div
      className={
        'absolute inset-y-2 rounded-lg border border-foreground/10 sm:w-64 lg:w-80 2xl:w-96' +
        ' overflow-hidden shrink-0 shadow-small bg-white dark:bg-foreground-100' +
        ' transition-[width] duration-500'
      }>
      <Input
        variant="flat"
        endContent={filterMenu()}
        placeholder="Search for extensions..."
        startContent={getIconByName('Circle', {className: 'size-5'})}
        classNames={{inputWrapper: 'bg-foreground-200 rounded-none pr-0'}}
      />

      <OverlayScrollbarsComponent
        options={{
          overflow: {x: 'hidden', y: 'scroll'},
          scrollbars: {
            autoHide: 'scroll',
            clickScroll: true,
            theme: isDarkMode ? 'os-theme-light' : 'os-theme-dark',
          },
        }}
        className="inset-0 absolute !top-10">
        {loading ? (
          <Spinner color="primary" className="size-full" label="Loading list..." />
        ) : (
          <List
            locale={{
              emptyText: (
                <Empty
                  description={
                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="text-gray-500 mb-2">Currently, no extensions are available.</p>
                      <p className="text-gray-400">Please check back later for updates!</p>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            size="small"
            className="size-full"
            dataSource={sortedList}
            renderItem={renderList}
            itemLayout="horizontal"
          />
        )}
      </OverlayScrollbarsComponent>
    </div>
  );
}
