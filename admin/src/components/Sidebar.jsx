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
  return (
    <Tooltip label={label} position='right' transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={clsx(
          "flex items-center gap-2 px-4 py-1.5 rounded-full",
          active ? "bg-black text-white" : ""
        )}
        data-active={active || undefined}
      >
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />

        {label}
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

  return (
    <nav className='h-full flex flex-col gap-5 border-t border-slate-700 px-6 2xl:px-14'>
      <p className='py-2'>MENU</p>

      <Stack justify='center' gap={10}>
        {links}
      </Stack>

      <ActionIcon
        onClick={() =>
          setColorScheme(colorScheme === "light" ? "dark" : "light")
        }
        variant='default'
        size='xl'
        aria-label='Toggle color scheme'
        className='w-full rounded-full mt-10'
      >
        {colorScheme === "dark" ? (
          <IconSun stroke={0.5} />
        ) : (
          <IconMoon stroke={0.5} />
        )}
      </ActionIcon>
    </nav>
  );
};

export default Sidebar;
