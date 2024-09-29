export type AvailablePages = '/imageGenerationPage' | '/textGenerationPage' | '/audioGenerationPage';

export type InstallStarterStep = {chosen: 'install' | 'locate'; dir?: string};
export type InstallUserInputType = 'checkbox' | 'text-input' | 'select' | 'directory' | 'file';
export type InstallUserInput = {id: string; label: string; type: InstallUserInputType; selectOptions?: string[]};
export type InstallUserInputReturn = {id: string; result: string | boolean};
export type InstallStepperType = {
  initialSteps: (steps: string[]) => void;
  nextStep: () => void;
  starterStep: () => Promise<InstallStarterStep>;
  clone: (url: string) => Promise<string>;
  execTerminalFile: (dir: string, file: string) => Promise<void>;
  execTerminalCommands: (commands: string | string[], dir?: string) => Promise<void>;
  downloadFile: (url: string) => Promise<string>;
  setInstalled: (dir: string) => void;
  userInput: (elements: InstallUserInput[]) => Promise<InstallUserInputReturn[]>;
  done: (type: 'success' | 'error', title: string, description?: string) => void;
  utils: {
    decompressFile: (filePath: string) => Promise<string>;
    validateGitDir: (dir: string, url: string) => Promise<boolean>;
    checkFilesExist: (dir: string, filesName: string[]) => Promise<boolean>;
  };
};

/** These methods will be called in the renderer process */
export type CardRendererMethods = {
  /** This method will be called with terminal output line parameter
   * @return URL of running AI to be showing in browser of the user and
   * @return undefined if URL is not in that line */
  catchAddress?: (line: string) => string | undefined;

  /** Fetching and return array of available extensions in type of `ExtensionData` */
  fetchExtensionList?: () => Promise<ExtensionData[]>;

  /** Parse the given argument to string */
  parseArgsToString?: (args: ChosenArgument[]) => string;

  /** Parse given string to the arguments */
  parseStringToArgs?: (args: string) => ChosenArgument[];

  installUI?: {
    startInstall: (stepper: InstallStepperType) => void;
  };
};

export type CardData = {
  /**  ID will be used to managing state of card */
  id: string;

  /**  Card background */
  bgUrl: string;

  /**  Url to repository (Using this url recognize, clone and update card) */
  repoUrl: string;

  /**  The title of card */
  title: string;

  /**  Description about what card does */
  description: string;

  /**  The directory of extension (In relative path like '/extensions')
   *   - Leave undefined if WebUI have no extension ability
   */
  extensionsDir?: string;

  /** Type of AI (Using type for things like discord activity status) */
  type?: 'image' | 'audio' | 'text' | 'unknown';

  /** List of all available arguments
   *  - Leave undefined if WebUI have no arguments to config
   */
  arguments?: ArgumentsData;

  /** These methods will be called in the renderer process
   * @description This methods will be used when user interaction (Like recognizing URL to show in browser)
   */
  methods: CardRendererMethods;
};

export type PagesData = {
  /** Router path (For placing the card in relative page) */
  routePath: AvailablePages;

  /** Cards data */
  cards: CardData[];
};

export type CardModules = PagesData[];

export type RendererModuleImportType = {
  default: CardModules;
  setCurrentBuild?: (build: number) => void;
};

export type ChosenArgument = {name: string; value: string};

export type ArgumentType = 'Directory' | 'File' | 'Input' | 'DropDown' | 'CheckBox';

export type ArgumentItem = {
  name: string;
  description?: string;
  type: ArgumentType;
  defaultValue?: any;
  values?: string[];
};

export type ArgumentSection = {
  section: string;
  items: ArgumentItem[];
};

export type ArgumentsData = (
  | {
      category: string;
      condition?: string;
      sections: ArgumentSection[];
    }
  | {
      category: string;
      condition?: string;
      items: ArgumentItem[];
    }
)[];
