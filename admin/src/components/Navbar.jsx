import {
  Button,
  Drawer,
  Menu,
  rem,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash, IconSettings } from "@tabler/icons-react";
import clsx from "clsx";
import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { BiMenu } from "react-icons/bi";
import {
  FaFacebook,
  FaInstagram,
  FaTwitterSquare,
  FaUser,
  FaYoutube,
} from "react-icons/fa";
import { MdArrowForward } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import useStore from "../store";
import Logo from "./Logo";
import Sidebar from "./Sidebar";

const MobileDrawer = ({ theme }) => {
  const { user } = useStore();
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        classNames={{
          content: clsx(theme ? 'bg-slate-800' : 'bg-white'),
        }}
      >
        <Sidebar close={close} />

        <div className='w-full mt-10'>
          <UserMenu user={user?.user} theme={theme} />
        </div>
      </Drawer>

      <Button
        variant='subtle'
        className={theme ? "text-slate-100 hover:bg-slate-700" : "text-slate-900 hover:bg-slate-100"}
        onClick={open}
        p='xs'
      >
        <BiMenu className='text-xl' />
      </Button>
    </>
  );
};

function UserMenu({ user, theme }) {
  const { signOut } = useStore();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    signOut();
  };

  const handleDeleteAccount = () => {
    // This will be handled by navigating to profile and clicking delete there
    window.location.href = '/profile#delete-account';
  };

  return (
    <Menu shadow='md' width={240} position='bottom-end'>
      <Menu.Target>
        <Button
          variant='subtle'
          className={clsx(
            'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:bg-opacity-80 whitespace-nowrap',
            theme
              ? 'hover:bg-slate-700/50 text-slate-100'
              : 'hover:bg-slate-100/50 text-slate-900'
          )}
        >
          <img
            src={user?.image}
            alt='Profile'
            className='w-10 h-10 rounded-full ring-2 ring-blue-500/30 flex-shrink-0'
          />
          <div className='flex flex-col items-start min-w-0'>
            <p className='text-sm font-semibold truncate'>{user?.name}</p>
            <span className='text-xs font-medium opacity-70'>{user?.accountType}</span>
          </div>
        </Button>
      </Menu.Target>

      <Menu.Dropdown className={clsx(theme ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <Menu.Label className={theme ? 'text-slate-400' : 'text-slate-600'}>Application</Menu.Label>
        <Menu.Item
          leftSection={<FaUser style={{ width: rem(14), height: rem(14) }} />}
          component={Link}
          to='/profile'
          className={clsx(
            'transition-colors',
            theme
              ? 'hover:bg-slate-700'
              : 'hover:bg-slate-100'
          )}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconSettings style={{ width: rem(14), height: rem(14) }} />
          }
          component={Link}
          to='/profile'
          className={clsx(
            'transition-colors',
            theme
              ? 'hover:bg-slate-700'
              : 'hover:bg-slate-100'
          )}
        >
          Settings
        </Menu.Item>
        <Menu.Item
          leftSection={
            <AiOutlineLogout style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() => handleSignOut()}
          className={clsx(
            'transition-colors',
            theme
              ? 'hover:bg-slate-700'
              : 'hover:bg-slate-100'
          )}
        >
          Logout
        </Menu.Item>

        <Menu.Divider className={theme ? 'border-slate-700' : 'border-slate-200'} />

        <Menu.Label className={theme ? 'text-slate-400' : 'text-slate-600'}>Danger Zone</Menu.Label>
        <Menu.Item
          color='red'
          leftSection={
            <IconTrash style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() => handleDeleteAccount()}
          className={clsx(
            'transition-colors',
            theme
              ? 'hover:bg-red-900/20'
              : 'hover:bg-red-50'
          )}
        >
          Delete account
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

const Navbar = () => {
  const { colorScheme } = useMantineColorScheme();

  const { user, signInModal, setSignInModal } = useStore();
  const location = useLocation();
  const theme = colorScheme === "dark";

  const handleLogin = () => {
    location.pathname === "/auth" && setSignInModal(!signInModal);
  };

  return (
    <div className={clsx(
      'w-full fixed top-0 z-50 flex flex-row px-4 md:px-6 py-4 md:py-5 items-center justify-between gap-4 shadow border-b transition-all',
      theme
        ? 'bg-slate-900/95 border-slate-700/50'
        : 'bg-white/95 border-slate-200/50'
    )}>
      {user && (
        <div className='block lg:hidden'>
          <MobileDrawer theme={theme} />
        </div>
      )}

      <div className='hidden lg:flex gap-3 text-[20px]'>
        <Link to='/' className='text-red-600 hover:text-red-700 transition-colors'>
          <FaYoutube />
        </Link>
        <Link to='/' className='text-blue-600 hover:text-blue-700 transition-colors'>
          <FaFacebook />
        </Link>
        <Link to='/' className='text-blue-400 hover:text-blue-500 transition-colors'>
          <FaTwitterSquare />
        </Link>
        <Link to='/' className='text-pink-600 hover:text-pink-700 transition-colors'>
          <FaInstagram />
        </Link>
      </div>

      <div className='flex-1 flex justify-center'>
        <Logo />
      </div>

      <div className='flex gap-4 items-center'>
        {/* show when not signed in */}
        {!user?.token ? (
          <Link
            to="/auth"
            onClick={handleLogin}
            style={{ display: "inline-flex", zIndex: 9999, position: "relative" }}
            className={clsx(
              "items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm",
              theme
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
            )}
            aria-label="Sign in"
          >
            <span>Sign in</span>
            <MdArrowForward className='text-base' />
          </Link>
        ) : (
          <UserMenu user={user?.user} theme={theme} />
        )}
      </div>
    </div>
  );
};

export default Navbar;
