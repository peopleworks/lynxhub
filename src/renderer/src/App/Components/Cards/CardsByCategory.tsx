import {Empty} from 'antd';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {compact, isEmpty, isNil} from 'lodash';
import {memo, useMemo} from 'react';

import {extractGitUrl} from '../../../../../cross/CrossUtils';
import {Apps_Color_Icon, History_Color_Icon, Pin_Color_Icon} from '../../../assets/icons/SvgIcons/SvgIconsColor';
import {extensionsData} from '../../Extensions/ExtensionLoader';
import {allCards} from '../../Modules/ModuleLoader';
import {CardData} from '../../Modules/types';
import {useCardsState} from '../../Redux/AI/CardsReducer';
import {searchInStrings} from '../../Utils/UtilFunctions';
import {CardContainerClasses} from '../Pages/CardContainer';
import HomeCategory from '../Pages/ContentPages/Home/HomeCategory';
import LynxCard from './Card/LynxCard';
import {CardContext, CardsDataManager} from './CardsDataManager';

/**
 * Custom hook that returns cards by their IDs
 * @param cardIds Array of card IDs
 * @returns Array of CardData objects
 */
const useCardsById = (cardIds: string[]): CardData[] => {
  const cards = useMemo(() => {
    return cardIds.map(cardId => allCards.find(card => card && card.id === cardId)) as CardData[];
  }, [cardIds]);

  return cards.filter(Boolean);
};

/**
 * Renders a list of cards by their IDs
 */
const CardsById = ({cardIds, cat}: {cardIds: string[]; cat: string}) => {
  const installedCards = useCardsState('installedCards');
  const cards = useCardsById(cardIds);
  const installedCardSet = useMemo(() => new Set(installedCards.map(card => card.id)), [installedCards]);

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  return (
    <LayoutGroup id={`${cat}_cards_category`}>
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          cards.map(card => {
            const context = new CardsDataManager(card, installedCardSet.has(card.id));
            return (
              <CardContext.Provider value={context} key={`cardProv-${card.id}`}>
                {ReplaceComponent ? (
                  <ReplaceComponent context={context} key={`${card.id}-card-key`} />
                ) : (
                  <LynxCard key={`${card.id}-card-key`} />
                )}
              </CardContext.Provider>
            );
          })
        ) : (
          <ReplaceCards cards={cards} />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};

/** Renders all available cards */
const AllCards = () => {
  const installedCards = useCardsState('installedCards');
  const installedCardSet = useMemo(() => new Set(installedCards.map(card => card.id)), [installedCards]);

  const allCategory = useMemo(() => extensionsData.customizePages.home.add.allCategory, []);
  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  const pinnedCards = useCardsState('pinnedCards');

  const sortedCards = useMemo(() => {
    const pin = compact(allCards?.filter(card => pinnedCards.includes(card.id)));
    const rest = compact(allCards?.filter(card => !pinnedCards.includes(card.id)));
    return [...pin, ...rest];
  }, [pinnedCards]);

  if (isEmpty(sortedCards) && isEmpty(allCategory))
    return <Empty className="size-full" description="No Card to Display!" />;

  return (
    <LayoutGroup id="all_cards_category">
      <AnimatePresence>
        {isNil(ReplaceCards) ? (
          sortedCards.map(card => {
            const context = new CardsDataManager(card, installedCardSet.has(card.id));
            return (
              <CardContext.Provider value={context} key={`cardProv-${card.id}`}>
                {ReplaceComponent ? (
                  <ReplaceComponent context={context} key={`${card.id}-card-key`} />
                ) : (
                  <LynxCard key={`${card.id}-card-key`} />
                )}
                {...allCategory.map((All, index) => <All key={index} context={context} />)}
              </CardContext.Provider>
            );
          })
        ) : (
          <ReplaceCards cards={sortedCards} />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
};

/** Renders the "PINNED" category section */
export const PinnedCars = memo(() => {
  const pinnedCards = useCardsState('pinnedCards');
  const installedCards = useCardsState('installedCards');

  const pinCategory = useMemo(() => extensionsData.customizePages.home.add.pinCategory, []);

  const validPinnedCards = useMemo(() => {
    return pinnedCards.filter(pinnedCardId => installedCards.some(installedCard => installedCard.id === pinnedCardId));
  }, [pinnedCards, installedCards]);

  return (
    <HomeCategory
      title="PINNED"
      subTitle="Quick Access to Your Top AI Tools"
      icon={<Pin_Color_Icon className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(validPinnedCards) && isEmpty(pinCategory) ? (
          <Empty className="size-full" description="No Pinned Card to Display!" />
        ) : (
          <>
            <CardsById cat="pinned" cardIds={validPinnedCards} />
            {...pinCategory.map((Pin, index) => <Pin key={index} />)}
          </>
        )}
      </div>
    </HomeCategory>
  );
});

// Renders the "RECENTLY USED" category section
export const RecentlyCards = memo(() => {
  const recentlyUsedCards = useCardsState('recentlyUsedCards');
  const installedCards = useCardsState('installedCards');

  const recentlyCategory = useMemo(() => extensionsData.customizePages.home.add.recentlyCategory, []);

  const validRecentlyUsed = useMemo(() => {
    return recentlyUsedCards.filter(recentlyUsedCardId =>
      installedCards.some(installedCard => installedCard.id === recentlyUsedCardId),
    );
  }, [recentlyUsedCards, installedCards]);

  return (
    <HomeCategory
      title="RECENTLY USED"
      subTitle="Your Most Recent AI Interactions"
      icon={<History_Color_Icon className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        {isEmpty(validRecentlyUsed) && isEmpty(recentlyCategory) ? (
          <Empty className="size-full" description="No Recently Used Card to Display!" />
        ) : (
          <>
            <CardsById cat="recently" cardIds={validRecentlyUsed} />
            {...recentlyCategory.map((Recent, index) => <Recent key={index} />)}
          </>
        )}
      </div>
    </HomeCategory>
  );
});

// Renders the "All" category section
export const AllCardsSection = memo(() => {
  return (
    <HomeCategory
      title="All"
      subTitle="Explore the Complete List of AI Interfaces"
      icon={<Apps_Color_Icon className={CardContainerClasses} />}>
      <div className="flex w-full flex-wrap gap-5 overflow-visible scrollbar-hide">
        <AllCards />
      </div>
    </HomeCategory>
  );
});

export function CardsBySearch({searchValue}: {searchValue: string}) {
  const installedCards = useCardsState('installedCards');

  const searchData = useMemo(
    () =>
      allCards.map(card => ({
        id: card.id,
        data: [card.description, card.title, extractGitUrl(card.repoUrl).owner, extractGitUrl(card.repoUrl).repo],
      })),
    [],
  );

  const filteredCards = useMemo(
    () => allCards.filter(card => searchInStrings(searchValue, searchData.find(data => data.id === card.id)?.data)),
    [searchValue, searchData],
  );

  const ReplaceCards = useMemo(() => extensionsData.cards.replace, []);
  const ReplaceComponent = useMemo(() => extensionsData.cards.replaceComponent, []);

  return (
    <div className="flex w-full flex-wrap gap-5 overflow-y-scroll pb-6 pl-1 scrollbar-hide">
      {isEmpty(filteredCards) ? (
        <Empty className="w-full" description="No cards match your search." />
      ) : isNil(ReplaceCards) ? (
        filteredCards.map((card, index) => {
          const isInstalled = installedCards.some(iCard => iCard.id === card.id);
          const context = new CardsDataManager(card, isInstalled);
          return (
            <CardContext.Provider value={context} key={`cardProv-${index}`}>
              {ReplaceComponent ? (
                <ReplaceComponent context={context} key={`${card.id}-card-key`} />
              ) : (
                <LynxCard key={`${card.id}-card-key`} />
              )}
            </CardContext.Provider>
          );
        })
      ) : (
        <ReplaceCards cards={filteredCards} />
      )}
    </div>
  );
}
