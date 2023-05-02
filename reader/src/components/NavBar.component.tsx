/* This example requires Tailwind CSS v2.0+ */
import React, {Fragment, useContext} from 'react'
import {Disclosure, Menu, Transition} from '@headlessui/react'
import {TreeMenuNode} from "./app-directory/tree-menu-node.interface";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {classNames} from "./ClassNames";
import {NavBarOpenMenuButton} from "./NavBarOpenMenuButton";
import {NavBarFullScreenNavItems} from "./NavBarFullScreenNavItems";
import {NavBarFullScreenNavItem} from "./NavBarFullScreenNavItem";
import {NavBarProfileMenuProfileButton} from "./NavBarProfileMenuProfileButton";
import {NavBarProfileSettingsLink} from "./NavBarProfileSettingsLink";
import {NavBarProfileSignOutLink} from "./NavBarProfileSignOutLink";
import {NavBarMobileNavLink} from "./NavBarMobileNavLink";
import EllipsesLoader from "./EllipsesLoader";
import {uniq} from "lodash";


export const NavBar = (
    {
        navItems,
        userProfileButton
    }: {
        navItems: TreeMenuNode[],
        userProfileButton: React.ReactNode
    }) => {
    const m = useContext(ManagerContext);
    const l1 = useObservableState(m.progressItemService.progressItemText$) || []
    const l2 = useObservableState(m.loadingService.loadingMessage$)?.map(item => item.message) || []
    const progressItems = uniq([...l1, ...l2]);
    return (
        <Disclosure as="nav" className="bg-gray-800 w-full">
            {({open}) => (
                <>
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-between h-16">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <NavBarOpenMenuButton open={open}/>
                                <EllipsesLoader items={progressItems}/>
                            </div>
                            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">

                                <NavBarFullScreenNavItems elements={navItems.map((item) => {
                                    return <NavBarFullScreenNavItem
                                        item={item}
                                        className={({isActive, isPending}) =>
                                            classNames(
                                                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                'px-3 py-2 rounded-md text-sm font-medium'
                                            )}/>;
                                })}/>
                                <EllipsesLoader items={progressItems}/>
                            </div>
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

                                {/* Profile dropdown */}

                                <Menu as="div" className="ml-3 relative">
                                    <div>
                                        <Menu.Button
                                            className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                                            <span className="sr-only">Open user menu</span>
                                            {userProfileButton}
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items
                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <Menu.Item>
                                                {({active}) => (
                                                    <NavBarProfileMenuProfileButton active={active}/>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({active}) => (
                                                    <NavBarProfileSettingsLink active={active}/>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({active}) => (
                                                    <NavBarProfileSignOutLink active={active}/>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>

                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                return <NavBarMobileNavLink
                                    item={item}
                                    key={item.name}
                                    className={({isActive, isPending}) =>
                                        classNames(
                                            isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                            'block px-3 py-2 rounded-md text-base font-medium'
                                        )}/>;
                            })}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}