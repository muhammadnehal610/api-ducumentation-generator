
import React, { useState } from 'react';
import type { Controller } from '../types';
import { SelectedItem } from '../App';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SidebarProps {
    controllers: Controller[];
    selectedItem: SelectedItem;
    isCollapsed: boolean;
    onSetIsCollapsed: (isCollapsed: boolean) => void;
    onSelectItem: (item: SelectedItem) => void;
    onAddController: () => void;
    onAddRoute: (controllerId: string) => void;
    onDeleteController: (controllerId: string) => void;
    onDeleteRoute: (controllerId: string, routeId: string) => void;
}

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
    const colors = {
        GET: 'text-green-400',
        POST: 'text-blue-400',
        PUT: 'text-orange-400',
        DELETE: 'text-red-400',
        PATCH: 'text-yellow-400',
    };
    return (
        <span className={`w-12 text-left font-bold text-xs ${(colors as any)[method] || 'text-gray-400'}`}>
            {method}
        </span>
    );
}

const CollapseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
)
const ExpandIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
)


export const Sidebar: React.FC<SidebarProps> = ({ 
    controllers, 
    selectedItem, 
    isCollapsed,
    onSetIsCollapsed,
    onSelectItem,
    onAddController,
    onAddRoute,
    onDeleteController,
    onDeleteRoute
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        if (selectedItem?.controllerId) {
            initialState[selectedItem.controllerId] = true;
        }
        controllers.forEach(c => initialState[c.id] = true); // Default all to expanded
        return initialState;
    });

    const toggleController = (id: string) => {
        setExpanded(prev => ({...prev, [id]: !prev[id]}));
    };
    
    React.useEffect(() => {
        if (selectedItem?.controllerId && !expanded[selectedItem.controllerId]) {
            setExpanded(prev => ({...prev, [selectedItem.controllerId]: true}));
        }
    }, [selectedItem]);


    return (
        <div className="h-full flex flex-col relative">
            <button onClick={() => onSetIsCollapsed(!isCollapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 bg-gray-700 hover:bg-cyan-600 p-1 rounded-full text-white z-10">
                {isCollapsed ? <ExpandIcon/> : <CollapseIcon/>}
            </button>
            <div className="flex-grow">
                 {!isCollapsed && <h2 className="text-lg font-semibold text-gray-300 mb-4">API Controllers</h2>}
                <ul className="space-y-1">
                    {controllers.map(controller => (
                        <li key={controller.id}>
                            <div className={`flex items-center justify-between rounded-md p-2 group ${selectedItem?.type === 'controller' && selectedItem.controllerId === controller.id ? 'bg-cyan-600/20' : 'hover:bg-gray-700/50'}`}>
                                <button
                                    onClick={() => onSelectItem({ type: 'controller', controllerId: controller.id })}
                                    className="flex-grow text-left font-semibold truncate"
                                >
                                    <span onClick={(e) => { e.stopPropagation(); toggleController(controller.id); }} className="mr-2">{expanded[controller.id] ? '▼' : '▶'}</span>
                                    {!isCollapsed && controller.name}
                                </button>
                                <div className={`items-center gap-2 ${isCollapsed ? 'hidden' : 'hidden group-hover:flex'}`}>
                                    <button onClick={() => onAddRoute(controller.id)} className="text-green-400 hover:text-green-300"><PlusIcon /></button>
                                    <button onClick={() => onDeleteController(controller.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                </div>
                            </div>
                            {expanded[controller.id] && !isCollapsed && (
                                <ul className="pl-6 mt-1 border-l-2 border-gray-700">
                                    {controller.routes.map(route => (
                                         <li key={route.id} className={`flex items-center justify-between rounded-md text-sm group ${selectedItem?.type === 'route' && selectedItem.routeId === route.id ? 'bg-cyan-600/20' : 'hover:bg-gray-700/50'}`}>
                                            <button 
                                                onClick={() => onSelectItem({ type: 'route', controllerId: controller.id, routeId: route.id })}
                                                className="flex items-center gap-2 p-2 flex-grow text-left"
                                            >
                                                <MethodBadge method={route.method} />
                                                <span className="truncate">{route.endpoint}</span>
                                            </button>
                                            <div className="hidden group-hover:flex items-center pr-2">
                                                <button onClick={() => onDeleteRoute(controller.id, route.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                                            </div>
                                        </li>
                                    ))}
                                     <li className="pl-2 pt-1">
                                         <button onClick={() => onAddRoute(controller.id)} className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-medium w-full">
                                             <PlusIcon/> Add Route
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <button
                onClick={onAddController}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
                <PlusIcon />
                {!isCollapsed && 'Add Controller'}
            </button>
        </div>
    );
};
