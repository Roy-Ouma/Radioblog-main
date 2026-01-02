import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconGauge,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import useStore from "../store";
import {
  ActionIcon,
  Stack,
  Tooltip,
  UnstyledButton,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { BsPencilSquare } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";

const mockdata = [
  { icon: IconGauge, label: "Dashboard", to: "dashboard" },
  { icon: IconDeviceDesktopAnalytics, label: "Analytics", to: "analytics" },
    { icon: IconCalendarStats, label: "Content", to: "contents" },
    { icon: IconCalendarStats, label: "Pending", to: "pending" },
    { icon: IconCalendarStats, label: "Share Logs", to: "share-logs" },
    { icon: IconCalendarStats, label: "Banners", to: "banners" },
  { icon: IconUser, label: "Followers", to: "followers" },
  { icon: BsPencilSquare, label: "Create Post", to: "write" },
  { icon: IconSettings, label: "Settings" },
];

const NavbarLink = ({ icon: Icon, label, active, onClick }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "dark";

  return (
    <Tooltip label={label} position='right' transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={clsx(
          "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm",
          active
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
            : theme
              ? "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
              : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-900"
        )}
        data-active={active || undefined}
      >
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        <span>{label}</span>
      </UnstyledButton>
    </Tooltip>
  );
};

const Sidebar = ({ close = () => {} }) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname?.slice(1);

  const handleClick = (to) => {
    close();
    navigate(to);
  };

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={index}
      active={link.to === path}
      onClick={() => handleClick(link.to)}
    />
  ));

  // Add admin-only Users link
  const currentUser = useStore((s) => s.user);
  const adminLink =
    currentUser?.user?.accountType === "Admin" ? (
      <NavbarLink
        key="users"
        icon={IconUsers}
        label="Users"
        active={"users" === path}
        onClick={() => handleClick("users")}
      />
    ) : null;

  const theme = colorScheme === "dark";

  return (
    <nav className={clsx(
      'h-full flex flex-col gap-6 rounded-xl p-5 m-4 border transition-all',
      theme
        ? 'bg-slate-800/40 border-slate-700/50'
        : 'bg-slate-50 border-slate-200'
    )}>
      <div className='space-y-1'>
        <p className={clsx(
          'text-xs font-bold tracking-widest uppercase',
          theme ? 'text-slate-500' : 'text-slate-500'
        )}>
          Navigation
        </p>
      </div>

      <Stack justify='flex-start' gap={8}>
        {links}
      </Stack>

      {adminLink && (
        <>
          <div className={clsx(
            'h-px',
            theme ? 'bg-slate-700/50' : 'bg-slate-200'
          )} />
          <Stack justify='flex-start' gap={8}>
            {adminLink}
          </Stack>
        </>
      )}

      <div className='flex-1' />

      <div className={clsx(
        'pt-4 border-t',
        theme ? 'border-slate-700/50' : 'border-slate-200'
      )}>
        <ActionIcon
          onClick={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          variant='subtle'
          size='lg'
          aria-label='Toggle color scheme'
          className={clsx(
            'w-full rounded-lg transition-all',
            theme
              ? 'hover:bg-slate-700/50'
              : 'hover:bg-slate-100/50'
          )}
        >
          {colorScheme === "dark" ? (
            <IconSun stroke={1.5} size={20} />
          ) : (
            <IconMoon stroke={1.5} size={20} />
          )}
        </ActionIcon>
      </div>
    </nav>
  );
};

export default Sidebar;
