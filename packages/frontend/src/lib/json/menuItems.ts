// CAUTION do not allow sst/node pacakages to be accessed directly from frontend
// we have had to split out the types here rather than leave them in the core USer class package

import { RoleType as Role, type RoleType }  from '@sst-starter3/core/types/role';

type MenuItem = {
    name: string;
    link: string;
    isSelected: boolean;
    description: string;
    icon: string;
    menuItems?: MenuItem[];
    roles: RoleType[]
  };
export let menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      link: '/dashboard',
      isSelected: false,
      description: 'Dashboard',
      icon: 'home',
      roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
    },
    {
      name: 'Role1',
      link: '/role1',
      isSelected: false,
      description: 'Role1',
      icon: 'users',
      roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
      menuItems :[
        {
          name: 'Role1 menu item 1',
          link: '/role1/item1',
          isSelected: false,
          description: 'Role 1 Item1',
          icon: 'Item1',
          roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
        },
        {
          name: 'Role1 menu item 2',
          link: '/role1/item2',
          isSelected: false,
          description: 'Role 1, Item 2',
          icon: 'Item2',
          roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
        }
      ]
    },
    {
      name: 'Role2',
      link: '/role2',
      isSelected: false,
      description: 'Role2',
      icon: 'folder',
      roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
      menuItems: [
        {
          name: 'Role2 menu item 1',
          link: '/role2/item1',
          isSelected: false,
          description: 'Role2, Item 1',
          icon: 'home',
          roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
        },
        {
          name: 'Role2 menu item 2',
          link: '/role2/item2',
          isSelected: false,
          description: 'Role2, Item 2',
          icon: 'home',
          roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],

        }
      ]
    },
    {
        name: 'Settings',
        link: '/settings',
        isSelected: false,
        description: 'My Account',
        icon: 'settings',
        roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
        menuItems:[
            {
            name: 'My Account',
            link: '/settings/account',
            isSelected: false,
            description: 'My details',
            icon: 'home',
            roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
          },
            {
                name: 'Notifications',
                link: '/settings/notifications',
                isSelected: false,
                description: 'notifications',
                icon: 'home',
                roles: [Role.ADMIN, Role.COMMISSIONER, Role.PROVIDER_PLUS, Role.PROVIDER_BASIC, Role.PROVIDER_READ_ONLY],
              },
        ]
    },
];
