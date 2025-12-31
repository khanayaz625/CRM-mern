import React from 'react';

const Input = ({ label, icon: Icon, ...props }) => {
    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-surface/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white placeholder-gray-500 transition-colors`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
