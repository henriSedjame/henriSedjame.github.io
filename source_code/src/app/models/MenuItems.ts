export type MenuItemLabel = 'home' | 'about' | 'projects' | 'blog';

export type MenuItem = {
  label: MenuItemLabel;
  route: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {label: 'home', route: '/'},
  {label: 'about', route: '/about'},
  {label: 'projects', route: '/projects'},
  {label: 'blog', route: '/blog'},
]
