import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareOut as ArrowSquareOutIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';

import type { NavItemConfig, NavColor, ColorScheme } from '@/types/layout';
import { paths } from '../paths';
import { isNavItemActive } from '@/utils/is-nav-item-active';
// import { useSettings } from '@/hooks/use-settings';
// import { Logo } from '@/components/logo/Logo';
import { useWorkspaceContext } from '@/common/sdk/provider/WorkspaceContext';

import { icons } from '../nav-icons';
import { WorkspacesSwitch } from '../workspaces-switch';
import { navColorStyles } from './styles';
// import { LogoResidential } from '@/components/core/logoResidential';

const logoColors = {
  dark: { blend_in: 'light', discrete: 'dark', evident: 'light' },
  light: { blend_in: 'dark', discrete: 'dark', evident: 'light' },
} as Record<ColorScheme, Record<NavColor, 'dark' | 'light'>>;

export interface SideNavProps {
  color?: NavColor;
  items?: NavItemConfig[];
}

export function SideNav({ color = 'evident', items = [] }: SideNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { selectedWorkspace } = useWorkspaceContext();
  const workspaceId = selectedWorkspace?.ref || '1'; // Fallback to '1' if no workspace is selected

  const colorScheme = 'light';
  // const {
  //   settings: { colorScheme = 'light' },
  // } = useSettings();

  const styles = navColorStyles[colorScheme][color];
  const logoColor = logoColors[colorScheme][color];

  return (
    <Box
      sx={{
        ...styles,
        bgcolor: 'var(--SideNav-background)',
        borderRight: '1px solid #E0E0E0',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.05)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: 'calc(100vh - var(--MainNav-height))',
        width: 'var(--SideNav-width)',
        position: 'sticky',
        top: 'var(--MainNav-height)',
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <WorkspacesSwitch />
      </Stack>
      <Divider />
      <Box
        component="nav"
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          p: 2,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {renderNavGroups({ items, pathname, workspaceId })}
      </Box>
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography sx={{
          lineHeight: 1.2,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'text.secondary'
        }}>
          &copy; 2024, FONOSTER. V0.3.4
        </Typography>
      </Stack>
    </Box>
  );
}

function renderNavGroups({ items, pathname, workspaceId }: { items: NavItemConfig[]; pathname: string; workspaceId: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    // Process items to check for dynamic paths
    let processedItems = curr.items;
    if (curr.items) {
      processedItems = curr.items.map(item => {
        if (item.href && item.href.startsWith('/workspace/')) {
          const pathParts = item.href.split('/');
          if (pathParts.length > 2) {
            pathParts[2] = workspaceId;
            return { ...item, href: pathParts.join('/') };
          }
        }
        return item;
      });
    }

    acc.push(
      <Stack component="li" key={curr.key} spacing={1.5}>
        {curr.title ? (
          <div>
            <Typography sx={{ color: 'var(--NavGroup-title-color)', fontSize: '0.875rem', fontWeight: 500 }}>
              {curr.title}
            </Typography>
          </div>
        ) : null}
        <div>{renderNavItems({ depth: 0, items: processedItems, pathname, workspaceId })}</div>
      </Stack>
    );

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={2} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

function renderNavItems({
  depth = 0,
  items = [],
  pathname,
  workspaceId,
}: {
  depth: number;
  items?: NavItemConfig[];
  pathname: string;
  workspaceId: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { items: childItems, key, ...item } = curr;

    // Process dynamic paths from the paths object
    let processedItem = { ...item };
    if (item.href && item.href.startsWith('/workspace/')) {
      // This is a dynamic path that needs the workspace ID
      const pathParts = item.href.split('/');
      if (pathParts.length > 2) {
        // Replace the workspace ID placeholder with the actual ID
        pathParts[2] = workspaceId;
        processedItem.href = pathParts.join('/');
      }
    }

    // Process child items to check for dynamic paths
    let processedChildItems = childItems;
    if (childItems) {
      processedChildItems = childItems.map(childItem => {
        if (childItem.href && childItem.href.startsWith('/workspace/')) {
          const pathParts = childItem.href.split('/');
          if (pathParts.length > 2) {
            pathParts[2] = workspaceId;
            return { ...childItem, href: pathParts.join('/') };
          }
        }
        return childItem;
      });
    }

    const forceOpen = processedChildItems
      ? Boolean(processedChildItems.find((childItem) => childItem.href && pathname && pathname.startsWith(childItem.href)))
      : false;

    acc.push(
      <NavItem depth={depth} forceOpen={forceOpen} key={key} pathname={pathname} workspaceId={workspaceId} {...processedItem}>
        {processedChildItems ? renderNavItems({ depth: depth + 1, pathname, items: processedChildItems, workspaceId }) : null}
      </NavItem>
    );

    return acc;
  }, []);

  return (
    <Stack component="ul" data-depth={depth} spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  children?: React.ReactNode;
  depth: number;
  forceOpen?: boolean;
  pathname: string;
  workspaceId: string;
}

function NavItem({
  children,
  depth,
  disabled,
  external,
  forceOpen = false,
  href,
  icon,
  label,
  matcher,
  pathname,
  title,
  workspaceId,
}: NavItemProps): React.JSX.Element {
  const [open, setOpen] = React.useState<boolean>(forceOpen);
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? icons[icon] : null;
  const ExpandIcon = open ? CaretDownIcon : CaretRightIcon;
  const isBranch = children && !href;
  const showChildren = Boolean(children && open);

  return (
    <Box component="li" data-depth={depth} sx={{ userSelect: 'none' }}>
      <Box
        {...(isBranch
          ? {
            onClick: (): void => {
              setOpen(!open);
            },
            onKeyUp: (event: React.KeyboardEvent<HTMLDivElement>): void => {
              if (event.key === 'Enter' || event.key === ' ') {
                setOpen(!open);
              }
            },
            role: 'button',
          }
          : {
            ...(href
              ? {
                component: external ? 'a' : RouterLink,
                href,
                target: external ? '_blank' : undefined,
                rel: external ? 'noreferrer' : undefined,
              }
              : { role: 'button' }),
          })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease-in-out',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
            ...(depth > 0 && {
              '&::before': {
                bgcolor: 'var(--NavItem-children-indicator)',
                borderRadius: '2px',
                content: '" "',
                height: '20px',
                left: '-14px',
                position: 'absolute',
                width: '3px',
              },
            }),
          }),
          ...(open && { color: 'var(--NavItem-open-color)' }),
          '&:hover': {
            ...(!disabled &&
              !active && {
              bgcolor: '#00ab5514',
              color: 'var(--NavItem-hover-color)',
              transform: 'translateX(4px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }),
          },
        }}
        tabIndex={0}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={forceOpen || active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {title}
            {active && (
              <Box
                sx={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#00ab55',
                  display: 'inline-block'
                }}
              />
            )}
          </Typography>
        </Box>
        {label ? <Chip color="primary" label={label} size="small" /> : null}
        {external ? (
          <Box sx={{ alignItems: 'center', display: 'flex', flex: '0 0 auto' }}>
            <ArrowSquareOutIcon color="var(--NavItem-icon-color)" fontSize="var(--icon-fontSize-sm)" />
          </Box>
        ) : null}
        {isBranch ? (
          <Box sx={{ alignItems: 'center', display: 'flex', flex: '0 0 auto' }}>
            <ExpandIcon color="var(--NavItem-expand-color)" fontSize="var(--icon-fontSize-sm)" />
          </Box>
        ) : null}
      </Box>
      {showChildren ? (
        <Box sx={{ pl: '24px' }}>
          <Box sx={{ borderLeft: '1px solid var(--NavItem-children-border)', pl: '12px' }}>{children}</Box>
        </Box>
      ) : null}
    </Box>
  );
}
