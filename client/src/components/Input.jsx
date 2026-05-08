import React from 'react';

const Input = ({ label, icon: Icon, error, ...props }) => {
    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-gray-300">
                {label} {props.required && <span className="text-red-400">*</span>}
            </label>}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                {props.prefix && (
                    <span className={`absolute ${Icon ? 'left-11' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 font-medium`}>
                        {props.prefix}
                    </span>
                )}
                <input
                    className={`w-full ${Icon && props.prefix ? 'pl-20' :
                        Icon ? 'pl-10' :
                            props.prefix ? 'pl-12' : 'pl-4'
                        } pr-4 py-3 bg-surface/50 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl focus:outline-none focus:border-primary/50 text-white placeholder-gray-500 transition-colors`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
};

export default Input;
