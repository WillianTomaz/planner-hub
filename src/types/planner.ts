


export interface TodoItem {
  id: string;
  text: string;
  completed?: boolean; 
}

export interface AnnotationItem {
  id: string;
  title: string;
  description: string;
}

export interface ScheduleItem {
  id: string;
  dateAndTime: string;
  text: string;
  priority?: number; 
}
export type DescriptionItem = TodoItem | AnnotationItem | ScheduleItem;


export interface ItemContent {
  title: string;
  descriptionList: DescriptionItem[];
}

export interface UserConfig {
  id: string;
  name: string;
  username: string;
  permission: 'full' | 'read';
  active: boolean;
}

export interface AppConfig {
  darkModeEnabled: boolean;
  backupFileName: string;
  saveStatus?: 'Saved' | 'Not Saved';
  lastSaveTimestamp?: string;
}

export interface PlannerData {
  menuConfig: MenuConfig;
  userConfig: UserConfig[];
  appConfig: AppConfig[];
}

export interface MenuConfig {
  menuTitle: string;
  menuIcon: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  order: string;
  title: string;
  description: string;
  link: string;
  isVisible: boolean;
  showOnDashboard: boolean | string;
  itemsContent: ItemContent[] | '';
}



